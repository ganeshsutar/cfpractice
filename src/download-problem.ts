import * as vscode from 'vscode';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as util from 'util';
import * as path from 'path';
import * as templateFile from './files';

const mkdir = util.promisify(fs.mkdir);
const writeFile = util.promisify(fs.writeFile);

export function getUrl(input: string | undefined) : string | null {
    if(!input) return null;

    if(input.startsWith('http')) {
        return input;
    } else {
        let noMatches = input.match(/(\d+)/);
        let letterMatches = input.match(/[a-zA-Z]/);
        
        if(!(noMatches && letterMatches)) return null;
        return `https://codeforces.com/problemset/problem/${noMatches[0]}/${letterMatches[0]}`;
    }
}

function getBasicInfo($: any, url: any) {
    let info = {
        dirname: '',
        url: '',
        title: ''
    };
    let title = $('.problem-statement .header .title').text();
    let parts = url.split('/');
    let no = parts[parts.length-2];
    let letter = parts[parts.length-1].toLowerCase();
    info.dirname = `${no}${letter}-` + title.substr(2).trim().replace(/ /g, '-');
    info.url = url;
    info.title = title;
    return info;
}

function getTests($: any) {
    $('.problem-statement .sample-tests').find('.sample-test .input pre br').replaceWith('\n');
    $('.problem-statement .sample-tests').find('.sample-test .output pre br').replaceWith('\n');
    let inputs = $('.problem-statement .sample-tests').find('.sample-test .input pre').map((i: any, item: any) => {
        return $(item).text();
    });
    let outputs = $('.problem-statement .sample-tests').find('.sample-test .output pre').map((i: any, item: any) => {
        return $(item).text();
    });
    return {
        inputs, outputs
    };
}

export function downloadProblem(url: string) {
    return axios.get(url).then((response) => {
        let $ = cheerio.load(response.data);
        let info = getBasicInfo($, url);
        let tests = getTests($);
        return {info, tests};
    });
};

export function createDirectory(folderPath: string, data: any) {
    let problemDir = path.join(folderPath, data.info.dirname);
    console.log(data);
    if(!data.info.title) {
        throw 'Unable to get the title';
    }

    return mkdir(problemDir).then(() => {
        let mainFile = path.join(problemDir, 'Main.java');
        let mainFilePromise = writeFile(mainFile, templateFile.MainFile);
        let inputs: any[] = [];
        let outputs: any[] = [];

        data.tests.inputs.each((index: any, item: string) => {
            inputs.push(writeFile(path.join(problemDir, `input-${index}.txt`), item + ''));
        });

        data.tests.outputs.each((index: any, item: string) => {
            outputs.push(writeFile(path.join(problemDir, `output-${index}.txt`), item + ''));
        });

        return Promise.all([
            mainFilePromise,
            Promise.all(inputs),
            Promise.all(outputs)
        ]).then(() => {
            let mainUri = vscode.Uri.file(mainFile);
            return vscode.window.showTextDocument(mainUri);
        });
    });
}


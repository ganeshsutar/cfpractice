import axios from 'axios';
import * as cheerio from 'cheerio';

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


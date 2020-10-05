#!/usr/bin/env node


import process from 'process';
import jsonfile from 'jsonfile';
import { ProcessList } from './processes/process-list';
import fs from 'fs';
import path from 'path';

const pckg = jsonfile.readFileSync("./package.json");
const ang = jsonfile.readFileSync("C:/Source/Repos/Iridium/Modules/ANG/angular.json");

let nextitem: string | null, libraries, project;

// parse command-line arguments.
process.argv.filter((a, b) => b > 1).forEach(a => {
    if (a.startsWith('-')) {
        switch (a.toLowerCase()) {
            case '-l':
                nextitem = 'libraries';
                break;
            case '-p':
                nextitem = 'project';
                break;
            default:
                nextitem = null;
        }
    } else {
        if (nextitem === 'libraries') {
            libraries = eval(a);
        }
        if (nextitem === 'project') {
            project = eval(a);
        }
    }
});

console.log('Watch NG Libraries CLI utility, (c) 2020');

// if (!Object.keys(pckg.devDependencies).includes('@angular/cli')) {
//     console.error('Could not find @angular/cli in package.json');
// } else if ((project || []).length === 0 && (libraries || []).length === 0) {
//     console.error('There is no project and library to compile specified.');
// } else {
console.log(`Projects: ${project}`);
console.log(`Libraries: ${libraries}`);


getDir(path.join("C:/Source/Repos/Iridium/Modules/ANG/projects/errors/src"));

// new ProcessList(libraries || [], project || []);
// };

function getDir(dir: string) {
    let ret;
    ret = fs.readdir(dir, { withFileTypes: true }, (err, files) => console.log(files));
    // ret.forEach(f => console.log(f));
    // ret.filter(s => s.isDirectory).forEach(d => getDir(path.join(dir, d.name)));
}

const regex = /@NgModule\(\{([\s|\S]*)\}\)[\s|\S]*export class (.*)\{/gmi;
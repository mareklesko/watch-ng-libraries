#!/usr/bin/env node


import process from 'process';
import jsonfile from 'jsonfile';
import { ProcessList } from './processes/process-list';

const pckg = jsonfile.readFileSync("./package.json");
let nextitem: string | null, libraries, project;

// parse command-line arguments.
process.argv.filter((a, b) => b > 1).forEach(a => {
    if (a.includes('-')) {
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
            if (!Array.isArray(libraries)) { libraries = [libraries]; }
        } else if (nextitem === 'project') {
            if (a.includes('[')) {
                project = eval(a);
            } else {
                project = a;
            }
            if (!Array.isArray(project)) { project = [project]; }
        }
    }
});

if ((project || []).length === 0) {
    project
}

console.log('Watch NG Libraries CLI utility, (c) 2020');

if (!Object.keys(pckg.devDependencies).includes('@angular/cli')) {
    console.error('Could not find @angular/cli in package.json');
} else if ((project || []).length === 0 && (libraries || []).length === 0) {
    console.error('There is no project and library to compile specified.');
} else {
    console.log(`Projects: ${project}`);
    console.log(`Libraries: ${libraries}`);
    new ProcessList(libraries || [], project || []);
};

#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var process_1 = __importDefault(require("process"));
var jsonfile_1 = __importDefault(require("jsonfile"));
var process_list_1 = require("./processes/process-list");
var pckg = jsonfile_1.default.readFileSync("./package.json");
var nextitem, libraries, project;
// parse command-line arguments.
process_1.default.argv.filter(function (a, b) { return b > 1; }).forEach(function (a) {
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
    }
    else {
        if (nextitem === 'libraries') {
            libraries = eval(a);
            if (!Array.isArray(libraries)) {
                libraries = [libraries];
            }
        }
        else if (nextitem === 'project') {
            if (a.includes('[')) {
                project = eval(a);
            }
            else {
                project = a;
            }
            if (!Array.isArray(project)) {
                project = [project];
            }
        }
    }
});
if ((project || []).length === 0) {
    project;
}
console.log('Watch NG Libraries CLI utility, (c) 2020');
if (!Object.keys(pckg.devDependencies).includes('@angular/cli')) {
    console.error('Could not find @angular/cli in package.json');
}
else if ((project || []).length === 0 && (libraries || []).length === 0) {
    console.error('There is no project and library to compile specified.');
}
else {
    console.log("Projects: " + project);
    console.log("Libraries: " + libraries);
    new process_list_1.ProcessList(libraries || [], project || []);
}
;
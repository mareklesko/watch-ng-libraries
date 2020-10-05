#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var process_1 = __importDefault(require("process"));
var jsonfile_1 = __importDefault(require("jsonfile"));
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var pckg = jsonfile_1.default.readFileSync("./package.json");
var ang = jsonfile_1.default.readFileSync("C:/Source/Repos/Iridium/Modules/ANG/angular.json");
var nextitem, libraries, project;
// parse command-line arguments.
process_1.default.argv.filter(function (a, b) { return b > 1; }).forEach(function (a) {
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
    }
    else {
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
console.log("Projects: " + project);
console.log("Libraries: " + libraries);
getDir(path_1.default.join("C:/Source/Repos/Iridium/Modules/ANG/projects/errors/src"));
// new ProcessList(libraries || [], project || []);
// };
function getDir(dir) {
    var ret;
    ret = fs_1.default.readdir(dir, { withFileTypes: true }, function (err, files) { return console.log(files); });
    // ret.forEach(f => console.log(f));
    // ret.filter(s => s.isDirectory).forEach(d => getDir(path.join(dir, d.name)));
}

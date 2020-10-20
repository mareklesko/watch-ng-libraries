#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var process_1 = __importDefault(require("process"));
var jsonfile_1 = __importDefault(require("jsonfile"));
var process_list_1 = require("./processes/process.list");
var angular_parser_1 = require("./angular/angular.parser");
var commander_1 = __importDefault(require("commander"));
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var rimraf = require('rimraf');
var defaultpath = "C:/Source/Repos/Iridium/Modules/ANG";
commander_1.default
    .name('watch-ng-libraries')
    .description("CLI to run ng apps using monorepo libraries.")
    .version('0.0.1')
    .option('-d, --directory <angular project directory>', 'working directory of angular project')
    .option('-l, --libraries <lib,lib2,...>', 'list of libraries in chronological order to be used instead of parsed structure')
    .option('-p, --detached', 'run ng serve command in detached window for detailed output')
    .option('-r, --delete', 'clean-up ./dist directory in angular project')
    .option('-v, --verbose', 'detailed output from ng compiler')
    .option('-a, --ngccarguments <ng_build_option1,ng_build_option2,...>', 'production build with list of ng build options passed to application build');
commander_1.default
    .command('serve <project>', { isDefault: true })
    .description("Command to serve project.")
    .action(runServe);
commander_1.default
    .command('build <project>', { isDefault: true })
    .description("Command to build project.")
    .action(runBuild);
if (process_1.default.argv.length === 2) {
    commander_1.default.outputHelp();
}
else {
    commander_1.default.parse(process_1.default.argv);
}
function getEnvironment(p, project) {
    var dir = __dirname;
    if (p.directory) {
        dir = p.directory;
    }
    console.log(dir);
    var deps;
    if (p.delete) {
        try {
            rimraf.sync(path_1.default.join(dir, 'dist'));
            console.log((path_1.default.join(dir, 'dist') + " directory deleted.").red);
        }
        catch (err) {
            console.error(err.Error);
        }
    }
    if (fs_1.default.existsSync(path_1.default.join(dir, "package.json"))) {
        var pckg = jsonfile_1.default.readFileSync(path_1.default.join(dir, "package.json"));
        if (pckg.devDependencies["@angular/cli"]) {
            if (p.libraries && p.libraries !== 'false' && p.libraries !== 'none') {
                deps = p.libraries.split(',').concat([project]);
                console.log('skipping processing angular.json'.yellow);
            }
            else if (p.libraries === 'false' || p.libraries === 'none') {
                deps = [project];
            }
            else {
                deps = new angular_parser_1.AngularParser(dir).getDependecies(project);
            }
        }
        else {
            console.warn(("Could not find @angular/cli in package.json in " + dir).yellow);
            process_1.default.exit();
        }
    }
    else {
        console.warn(("Could not find package.json in " + dir).yellow);
        process_1.default.exit();
    }
    return { deps: deps, dir: dir };
}
function runServe(project) {
    console.log(commander_1.default.name());
    console.log("Serving project " + project + "...");
    var _a = getEnvironment(commander_1.default, project), deps = _a.deps, dir = _a.dir;
    new process_list_1.ProcessList(deps.slice(0, -1), deps[deps.length - 1], dir, commander_1.default.detached, false, commander_1.default.ngccarguments ? (commander_1.default.ngccarguments.split(',')) : [], commander_1.default.verbose);
}
function runBuild(project) {
    console.log(commander_1.default.name());
    console.log("Building project " + project + "...");
    var _a = getEnvironment(commander_1.default, project), deps = _a.deps, dir = _a.dir;
    new process_list_1.ProcessList(deps.slice(0, -1), deps[deps.length - 1], dir, commander_1.default.detached, true, commander_1.default.ngccarguments ? (commander_1.default.ngccarguments.split(',')) : [], commander_1.default.verbose);
}

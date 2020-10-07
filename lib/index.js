#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var process_1 = __importDefault(require("process"));
var jsonfile_1 = __importDefault(require("jsonfile"));
var process_list_1 = require("./processes/process-list");
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
    .option('-l, --libraries <lib,lib2,...>', 'List of libraries in chronological order to be used instead of parsed structure')
    .option('-d, --directory <angular project directory>', 'Working directory of angular project')
    .option('-p, --detached', 'Run ng serve command in detached window for detailed output.')
    .option('-r, --delete', 'clean-up ./dist directory in angular project.')
    .command('serve <project>', { isDefault: true })
    .description("CLI to run ng apps using monorepo libraries.")
    .action(runProgram);
if (process_1.default.argv.length === 2) {
    commander_1.default.outputHelp();
}
else {
    commander_1.default.parse(process_1.default.argv);
}
function runProgram(project) {
    console.log(commander_1.default.name());
    var dir = __dirname;
    if (commander_1.default.directory) {
        dir = commander_1.default.directory;
    }
    var deps;
    if (commander_1.default.delete) {
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
            if (commander_1.default.libraries) {
                deps = commander_1.default.libraries.split(',').concat([project]);
                console.log('skipping processing angular.json'.yellow);
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
    new process_list_1.ProcessList(deps.slice(0, -1), deps[deps.length - 1], dir, commander_1.default.detached);
}
//# sourceMappingURL=index.js.map
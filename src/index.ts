#!/usr/bin/env node

import process from "process";
import jsonfile from "jsonfile";
import { ProcessList } from "./processes/process-list";
import { AngularParser } from "./angular/angular.parser";
import program from 'commander';
import fs from 'fs';
import path from 'path';
import colors from 'colors';

const rimraf = require('rimraf');
const defaultpath = "C:/Source/Repos/Iridium/Modules/ANG";

program
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

if (process.argv.length === 2) {
    program.outputHelp();
} else {
    program.parse(process.argv);
}

function runProgram(project: string) {

    console.log(program.name());

    let dir = __dirname;
    if (program.directory) { dir = program.directory; }

    let deps;
    if (program.delete) {
        try {
            rimraf.sync(path.join(dir, 'dist'));
            console.log(`${path.join(dir, 'dist')} directory deleted.`.red);
        } catch (err) {
            console.error(err.Error)
        }
    }



    if (fs.existsSync(path.join(dir, "package.json"))) {
        const pckg = jsonfile.readFileSync(path.join(dir, "package.json"));
        if (pckg.devDependencies["@angular/cli"]) {
            if (program.libraries) {
                deps = program.libraries.split(',').concat([project]);
                console.log('skipping processing angular.json'.yellow);
            } else {
                deps = new AngularParser(dir).getDependecies(project);
            }
        } else {
            console.warn(`Could not find @angular/cli in package.json in ${dir}`.yellow);
            process.exit();
        }
    } else {
        console.warn(`Could not find package.json in ${dir}`.yellow);
        process.exit();
    }

    new ProcessList(deps.slice(0, -1), deps[deps.length - 1], dir, program.detached);
}

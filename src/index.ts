#!/usr/bin/env node

import process from "process";
import jsonfile from "jsonfile";
import { ProcessList } from "./processes/process.list";
import { AngularParser } from "./angular/angular.parser";
import { AngularProject } from "./angular/angular.project";

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

program
    .command('serve <project>', { isDefault: false })
    .option('-d, --directory <angular project directory>', 'working directory of angular project')
    .option('-l, --libraries <lib,lib2,...>', 'list of libraries in chronological order to be used instead of parsed structure')
    .option('-p, --detached', 'run ng serve command in detached window for detailed output')
    .option('-r, --delete', 'clean-up ./dist directory in angular project')
    .option('-v, --verbose', 'detailed output from ng compiler')
    .option('-m, --memory <megabytes>', 'set node\'s --max-old-space-size to defined amount for application build. default is 2048MB')
    .option('-a, --ngccarguments <ng_build_option1,ng_build_option2,...>', 'production build with list of ng build options passed to application build')
    .description("Command to serve project.")
    .action(runServe)

program
    .command('build <project>', { isDefault: false })
    .option('-d, --directory <angular project directory>', 'working directory of angular project')
    .option('-l, --libraries <lib,lib2,...>', 'list of libraries in chronological order to be used instead of parsed structure')
    .option('-p, --detached', 'run ng serve command in detached window for detailed output')
    .option('-r, --delete', 'clean-up ./dist directory in angular project')
    .option('-v, --verbose', 'detailed output from ng compiler')
    .option('-m, --memory <megabytes>', 'set node\'s --max-old-space-size to defined amount for application build. default is 2048MB')
    .option('-a, --ngccarguments <ng_build_option1,ng_build_option2,...>', 'production build with list of ng build options passed to application build')
    .option('-o, --omit', 'all libraries are build except the application. Needed in case when application needs extra build configurations.')
    .description("Command to build project.")
    .action(runBuild)

if (process.argv.length === 2) {
    program.outputHelp();
} else {
    program.parse(process.argv);
}


function getEnvironment(p: any, project: string) {
    let dir = __dirname;
    if (p.directory) { dir = p.directory; }
    let deps;
    if (p.delete) {
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
            if (p.libraries && p.libraries !== 'false' && p.libraries !== 'none') {
                deps = p.libraries.split(',').concat([project]);
                console.log('skipping processing angular.json'.yellow);
            } else if (p.libraries === 'false' || p.libraries === 'none') {
                deps = [project];
            }
            else {
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
    return { deps, dir };
}



function runServe(project: string) {

    console.log(program.name());
    console.log(`Serving project ${project}...`);

    const command = program.commands.find(x => x.name() === 'serve');
    if (!command) { process.exit(); }

    const { deps, dir } = getEnvironment(command, project);

    new ProcessList(
        deps.slice(0, -1),
        deps[deps.length - 1],
        dir,
        command.detached,
        false,
        command.ngccarguments ? (command.ngccarguments.split(',')) : [],
        command.verbose,
        command.memory || 2048
    );
}

function runBuild(project: string) {

    console.log(program.name());
    console.log(`Building project ${project}...`);

    const command = program.commands.find(x => x.name() === 'build');
    if (!command) { process.exit(); }

    const { deps, dir } = getEnvironment(command, project);

    new ProcessList(
        deps.slice(0, -1),
        command.omit ? "" : deps[deps.length - 1],
        dir,
        command.detached,
        true,
        command.ngccarguments ? (command.ngccarguments.split(',')) : [],
        command.verbose,
        command.memory || 2048
    );
}
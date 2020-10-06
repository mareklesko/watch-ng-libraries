#!/usr/bin/env node

import process from "process";
import jsonfile from "jsonfile";
import { ProcessList } from "./processes/process-list";
import fs from "fs";
import path from "path";
import { withLatestFrom } from "rxjs/operators";
import { AngularParser } from "./angular/angular.parser";

// const defaultpath = "/home/marek/Iridium/Modules/ANG";
const defaultpath = "C:/Source/Repos/Iridium/Modules/ANG";
const pckg = jsonfile.readFileSync("./package.json");

let nextitem: string | null, libraries: any, project: any;

new AngularParser(defaultpath);

// do {} while (true);
// process.exit();
// // parse command-line arguments.
// process.argv
//   .filter((a, b) => b > 1)
//   .forEach((a) => {
//     if (a.startsWith("-")) {
//       switch (a.toLowerCase()) {
//         case "-l":
//           nextitem = "libraries";
//           break;
//         case "-p":
//           nextitem = "project";
//           break;
//         default:
//           nextitem = null;
//       }
//     } else {
//       if (nextitem === "libraries") {
//         libraries = eval(a);
//       }
//       if (nextitem === "project") {
//         project = eval(a);
//       }
//     }
//   });

// console.log("Watch NG Libraries CLI utility, (c) 2020");

// if (!Object.keys(pckg.devDependencies).includes("@angular/cli")) {
//   console.error("Could not find @angular/cli in package.json");
// } else if ((project || []).length === 0 && (libraries || []).length === 0) {
//   console.error("There is no project and library to compile specified.");
// } else {
//   new ProcessList(libraries || [], project || []);
// }

// do {} while (true);

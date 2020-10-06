#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var jsonfile_1 = __importDefault(require("jsonfile"));
var angular_parser_1 = require("./angular/angular.parser");
// const defaultpath = "/home/marek/Iridium/Modules/ANG";
var defaultpath = "C:/Source/Repos/Iridium/Modules/ANG";
var pckg = jsonfile_1.default.readFileSync("./package.json");
var nextitem, libraries, project;
new angular_parser_1.AngularParser(defaultpath);
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

import { AngularModule } from "./angular.module.parser";
import path from "path";
import fs from "fs";
import { Angular } from "./angular";
import { AngularParser } from "./angular.parser";

const moduleParser = /@NgModule\(\{[\s|\S]*imports\:([\s|\S]*?\]\,)[\S|\s]*\}\)[\s|\S]*export class (.*)\{/gim;
const regexImportsMl = /^\ *import (.*?)\;/gsm
const regexImports = /((.*|\n)?\ from\ (.*)?\;+)/gim;

export class AngularProject {
    public Children = new Array<AngularProject>();
    public Parents = new Array<AngularProject>();
    public Modules = new Array<AngularModule>();
    public Imports = new Array<string>();

    constructor(public Name: string, private RootDir: string, private Type: string) {
        this.parseDirContent(RootDir);
        this.sanitize();
    }

    parseDirContent(dir: string) {
        const files = fs.readdirSync(dir, { withFileTypes: true });
        files.forEach((f) => {
            if (f.isDirectory()) {
                this.parseDirContent(path.join(dir, f.name));
            } else {
                const ext = path.extname(path.join(dir, f.name));
                if (ext === '.ts') {
                    const ff = fs.readFileSync(path.join(dir, f.name)).toString();
                    this.parseFileContent(ff, f.name);
                }
            }
        });
    }

    parseFileContent(body: string, filename: string) {
        if (moduleParser.test(body)) {
            this.Modules.push(new AngularModule(body));
        }

        const ang = Angular.instance.ang.projects;
        const imports = new Array<string>();
        let m;
        while ((m = regexImportsMl.exec(body)) !== null) {
            if (m.index === regexImportsMl.lastIndex) {
                regexImportsMl.lastIndex++;
            }
            if (m[0] != '') {
                imports.push(m[0].replace(/\n/gmi, ''));
            }
        }

        imports.forEach(x => {
            let m;
            while ((m = regexImports.exec(x)) !== null) {
                if (m.index === regexImports.lastIndex) {
                    regexImports.lastIndex++;
                }
                if (m[3] != '') {
                    const name = m[3].replace(/\'/gmi, '');
                    if (Object.keys(ang).includes(name)) {
                        this.Imports.push(name);
                    }
                }
            }
        })
    }



    sanitize() {
        this.Modules.forEach(m => {
            this.Modules.forEach(i => {
                if (i.Name !== m.Name) {
                    if (i.Imports.includes(m.Name)) {
                        i.Imports = i.Imports.filter(x => x !== m.Name);
                    }
                }
            })
        })
        this.Imports = this.Imports.filter((item: any, i: any, ar: string | any[]) => ar.indexOf(item) === i);
    }
}

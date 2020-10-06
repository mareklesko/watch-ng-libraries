import { AngularModule } from "./angular.module.parser";
import path from "path";
import fs from "fs";

const moduleParser = /@NgModule\(\{[\s|\S]*imports\:([\s|\S]*?\]\,)[\S|\s]*\}\)[\s|\S]*export class (.*)\{/gim;

export class AngularProject {
    public Children = new Array<AngularProject>();
    public Parents = new Array<AngularProject>();
    public Modules = new Array<AngularModule>();
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
                if (f.name === '') { debugger; }
                const ff = fs.readFileSync(path.join(dir, f.name)).toString();
                this.parseFileContent(ff);
            }
        });
    }

    parseFileContent(body: string) {
        if (moduleParser.test(body)) {
            this.Modules.push(new AngularModule(body));
        }
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
    }
}

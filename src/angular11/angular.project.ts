import fs from "fs";
import path from 'path';

import { AngularProjectv11Module } from "./angular.module";
import { Crawl } from "./crawler/file.crawler";
import { IAngularProject, ImportsParser, ModuleParser, ModuleTester } from "./interfaces/angular.project.interface";

export abstract class AngularProjectv11Base implements IAngularProject {
    public ExportedModules = new Array<AngularProjectv11Module>();
    public ReferencedProjects = new Array<string>();
    public References: Array<IAngularProject> = new Array<IAngularProject>();
    public Path: string;
    public Name: string;
    public Level: number = 0;

    constructor(_path: string, name: string) {
        this.Name = name;
        this.Path = _path;

        const tsFiles = Crawl(this.Path, { Extensions: "ts" });
        tsFiles
            .forEach(file => {
                const body = fs.readFileSync(file).toString();
                if (ModuleTester.test(body))
                    this.ExportedModules.push(new AngularProjectv11Module(file, body))

                let m;

                while ((m = ImportsParser.exec(body)) !== null) {
                    if (m.index === ImportsParser.lastIndex)
                        ImportsParser.lastIndex++;

                    m
                        .filter((match, groupIndex) => groupIndex === 2
                            && !match.replace(/\"/gmi, "").replace(/\'/gmi, "").startsWith("./")
                            && !match.replace(/\"/gmi, "").replace(/\'/gmi, "").startsWith("../")
                        )
                        .forEach((match, groupIndex) => {
                            this.ReferencedProjects.push(match.replace(/\"/gmi, "").replace(/\'/gmi, ""));
                        });
                }

                this.ReferencedProjects = this.ReferencedProjects
                    .filter((value, index, self) => self.indexOf(value) === index)
            })
    }
}
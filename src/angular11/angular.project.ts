import fs from "fs";

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
    public abstract AllEntryPoints: string[];
    public abstract AllReferencedProjects: string[];

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
            })

        this.ReferencedProjects = this.ReferencedProjects
            .filter((value, index, self) => self.indexOf(value) === index)
    }

    CreateReferences(projects: IAngularProject[]) {
        const internalReferences = projects
            .map(x => x.AllEntryPoints)
            .reduce((tot, items) => tot = [...tot, ...items], []);

        this.ReferencedProjects = this.AllReferencedProjects.filter(x => (internalReferences || []).includes(x));

        const ref = this.AllReferencedProjects
            .map(pr => projects.find(x => x?.AllEntryPoints.includes(pr))?.Name)
            .filter((value, index, self) => self.indexOf(value) === index)
            .map(x => projects.find(y => y?.Name === x) || projects[0]);

        this.References = ref;
    }
}
import fs from "fs";
import path from 'path';

import { AngularProjectv11Module } from "./angular.module";
import { IAngularProject } from "./interfaces/angular.project.interface";
import { AngularSecondaryProjectv11 } from "./angular.secondary-project";
import { AngularProjectv11Base } from "./angular.project";

export class AngularProjectv11 extends AngularProjectv11Base {
    public ExportedModules = new Array<AngularProjectv11Module>();
    public SecondaryEntryPoints = new Array<IAngularProject>();

    public Level: number = 0;

    public get AllEntryPoints() {
        return [this.Name, ...this.SecondaryEntryPoints.map(x => x.Name)];
    }

    public get AllReferencedProjects() {
        return [
            ...this.ReferencedProjects,
            ...this.SecondaryEntryPoints
                .map(x => [...x.ReferencedProjects])
                .reduce((tot, item) => tot = [...tot, ...item], [])
        ]
            .filter((value, index, self) => self.indexOf(value) === index)
            .sort((a, b) => a > b ? 1 : 0);
    }

    public Type: ProjectType;

    constructor(_path: string, name: string, configJunk: any) {
        super(path.join(_path, configJunk.root === "" ? configJunk.sourceRoot : configJunk.root), name);

        this.Type = configJunk.projectType;

        this.SecondaryEntryPoints.push(...fs.readdirSync(this.Path, { withFileTypes: true })
            .filter(x => x.isDirectory())
            .filter(dir => {
                return fs.readdirSync(path.join(this.Path, dir.name), { withFileTypes: true })
                    .filter(x => x.name === 'ng-package.json' || x.name === 'package.json').length > 0

            })
            .map(dir => {
                const sp = new AngularSecondaryProjectv11(path.join(this.Path, dir.name), `${this.Name}/${dir.name}`)
                sp.Parent = this;
                return sp;
            })
        );

        this.SecondaryEntryPoints.forEach(ep => {
            ep.ReferencedProjects = ep.ReferencedProjects.filter(x => !this.AllEntryPoints.includes(x))
            this.ReferencedProjects.splice(this.ReferencedProjects.indexOf(ep.Name), 1)
        })
    }

    CreateReferences(projects: IAngularProject[]): void {
        this.SecondaryEntryPoints.forEach(x => x.CreateReferences(projects));
        super.CreateReferences(projects);
    }
}

export enum ProjectType {
    APPLICATION = "application",
    LIBRARY = "library"
}
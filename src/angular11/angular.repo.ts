import { AngularProjectv11 } from "./angular.project";
import fs from "fs";
import jsonfile from 'jsonfile';
import path from 'path';

export class AngularRepov11 {
    public Projects = new Array<AngularProjectv11>();
    public Configuration: any = {};

    constructor(public Path: string) {
        const configurationFile = fs.readdirSync(this.Path, { withFileTypes: true })
            .find(x => x.name === 'angular.json');

        this.Configuration = configurationFile ? jsonfile.readFileSync(path.join(this.Path, configurationFile.name)).projects : {};
        Object.keys(this.Configuration)
            .forEach(key => {
                this.Projects.push(new AngularProjectv11(this.Path, this.Configuration[key]))
            })

    }
}
import { ModuleNameParser } from "./interfaces/angular.project.interface";

export class AngularProjectv11Module {
    public Names = new Array<string>();
    constructor(public Path: string, body: string) {
        let m;
        while ((m = ModuleNameParser.exec(body)) !== null) {
            if (m.index === ModuleNameParser.lastIndex)
                ModuleNameParser.lastIndex++;

            m.filter((match, groupIndex) => groupIndex === 1)
                .forEach((match, groupIndex) => {
                    this.Names.push(match);
                });
        }
    }
}

import { AngularProjectv11 } from "./angular.primary.project";
import fs from "fs";
import jsonfile from 'jsonfile';
import path from 'path';
import { IAngularProject } from "./interfaces/angular.project.interface";


export class AngularRepov11 {
    public Projects = new Array<AngularProjectv11>();
    public Configuration: any = {};

    public get AllProjectReferences() {
        return this.Projects
            .map(x => x.AllEntryPoints)
            .reduce((tot, item) => tot = [...tot, ...item], [])
    }

    constructor(public Path: string) {
        const configurationFile = fs.readdirSync(this.Path, { withFileTypes: true })
            .find(x => x.name === 'angular.json');

        this.Configuration = configurationFile ? jsonfile.readFileSync(path.join(this.Path, configurationFile.name)).projects : {};
        Object.keys(this.Configuration)
            .forEach(key => {
                this.Projects.push(new AngularProjectv11(this.Path, key, this.Configuration[key]))
            })

        this.Projects.forEach(x => {
            x.ReferencedProjects = x.ReferencedProjects.filter(pr => this.AllProjectReferences.includes(pr) && x.Name !== pr)
            x.SecondaryEntryPoints.forEach(y => y.ReferencedProjects = y.ReferencedProjects.filter(pr => this.AllProjectReferences.includes(pr) && x.Name !== pr))
        })

        // this.Projects.forEach(x => {
        //     const ref = x.ReferencedProjects
        //         .filter(pr => this.AllProjectReferences.includes(pr))
        //         .map(x => this.Projects.find(pr => pr.AllEntryPoints.includes(x))?.Name ?? "")
        //         .filter((value, index, self) => self.indexOf(value) === index)
        //         .map(x => this.Projects.find(pr => pr.Name === x) ?? this.Projects[0]);

        //     x.References = ref;
        //     x.References
        //         .filter(ref => ref)
        //         .forEach(ref => ref ? ref.Level-- : null)
        // })

    }

    public GetReferences(project: string): IAngularProject[] | undefined {
        const proj = this.Projects.find(x => x.Name === project);
        if (typeof proj === 'undefined') return;

        const projectMap = proj.ReferencedProjects
            .map(pr => this.Projects.find(x => x.AllEntryPoints.includes(pr)))
            .map((x: any) => x.Name)
            .filter((value, index, self) => self.indexOf(value) === index);

        (proj as any).References = projectMap.map(x => this.Projects.find((z: IAngularProject) => z.Name === x));
        proj.References.forEach((ref: IAngularProject) => ref.References = this.GetReferences(ref.Name) ?? []);

        this.OrderProjectRefs(proj);
        return proj.References;
    }

    public OrderProjectRefs(project: IAngularProject) {
        project.Level--;
        project.References.forEach(pr => this.OrderProjectRefs(pr));
    }

    public FlattenProjects(project: string) {
        return this.FlattenProjectsImp(this.GetReferences(project) || [])
            .sort((a, b) => a.Level > b.Level ? 1 : -1)
            .filter((value: any, index, self) => self.indexOf(self.find((x: any) => x.Name === value.Name) ?? self[0]) === index);
    }

    private FlattenProjectsImp(projects: Array<IAngularProject>): { Name: string, Level: number }[] {
        const ret = projects.map(x => ({ Name: x.Name, Level: x.Level }));
        const subRet = projects
            .map(x => this.FlattenProjectsImp(x.References))
            .reduce((tot, item) => tot = [...tot, ...item], [])
            .map(x => ({ Name: x.Name, Level: x.Level }));

        return [...ret, ...subRet];
    }
}
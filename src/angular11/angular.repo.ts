import { AngularProjectv11 } from "./angular.primary.project";
import fs from "fs";
import jsonfile from 'jsonfile';
import path from 'path';
import { IAngularProject } from "./interfaces/angular.project.interface";


export class AngularRepov11 {
    public Projects = new Array<AngularProjectv11>();
    public Configuration: any = {};

    private RootProject: Reference | undefined;
    private Paths = new Array<string>();
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

        this.Projects.forEach(proj => proj.CreateReferences(this.Projects));
    }

    public GetReferences(project: string, referencee: Reference | undefined = undefined): IAngularProject[] | undefined {

        const proj = this.Projects.find(x => x.Name === project);
        if (typeof proj === 'undefined') return;

        const projectMap = proj.AllReferencedProjects
            .map(pr => this.Projects.find(x => x.AllEntryPoints.includes(pr)))
            .map((x: any) => x.Name)
            .filter((value, index, self) => self.indexOf(value) === index);

        const pref = new Reference(project, referencee);

        if (!referencee)
            this.RootProject = pref;

        // if (pref.Path.length > 3) {
        //     const partial = pref.Path.slice(0, 4).join("->");
        //     if (this.Paths.includes(partial))
        //         throw new Error(`Circular dependency found ${partial}`);
        //     else
        //         this.Paths.push(partial)
        // }

        let p = pref;
        const parents = [];
        let c = 0;
        // if (this.ParesedProjects.get(proj.Name))

        while (p?.Parent) {
            c++;
            parents.unshift(p.Name);
            p = p?.Parent;
        }

        if (c > this.Projects.length) {
            console.warn(`Circular dependency found: ${parents.join(" -> ")}`);
            process.exit(1);
        }

        (proj as any).References = projectMap.map(x => this.Projects.find((z: IAngularProject) => z.Name === x));
        proj.References.forEach((ref: IAngularProject) => ref.References = this.GetReferences(ref.Name, pref) ?? []);

        this.OrderProjectRefs(proj);
        return proj.References;
    }

    public OrderProjectRefs(project: IAngularProject) {
        project.Level--;
        project.References.forEach(pr => this.OrderProjectRefs(pr));
    }

    public FlattenProjects(project: string): string[] {
        return this.FlattenProjectsImp(this.GetReferences(project) || [])
            .sort((a, b) => a.Level > b.Level ? 1 : -1)
            .filter((value: any, index, self) => self.indexOf(self.find((x: any) => x.Name === value.Name) ?? self[0]) === index)
            .map(x => x.Name);
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

export class Reference {
    public get Path(): string[] {
        let p = this.Parent;
        const names = [this.Name];
        while (p?.Parent) {
            p = p.Parent;
            names.push(p.Name);
        }
        return names;
    }

    public Dependents = new Array<Reference>();

    constructor(public Name: string, public Parent: Reference | undefined) {
        this.Parent?.Dependents.push(this);
    }
}
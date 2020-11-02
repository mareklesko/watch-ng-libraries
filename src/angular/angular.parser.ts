import path from "path";
import { AngularModule } from "./angular.module.parser";
import { AngularProject } from "./angular.project";
import { Angular } from "./angular";

export class AngularParser {
  public Modules = new Array<AngularModule>();
  public Projects = new Array<AngularProject>();
  private Parents = new Array<string>();

  constructor(private Path: string) {
    new Angular(Path);
    this.parse(Angular.instance.ang);
    this.sanitize();
    this.createDependecies();
    this.Projects.forEach(pr => this.getCircularDeps(pr));
  }

  sanitize() {
    let allModules = new Array<string>();
    this.Projects.forEach(p => {
      allModules = allModules.concat(
        p.Modules.map(x => x.Name));
    });

    allModules = allModules.filter(
      (item: any, i: any, ar: string | any[]) => ar.indexOf(item) === i
    )

    this.Projects.forEach(p => {
      p.Modules.forEach(m => {
        m.Imports.forEach(i => {
          if (!allModules.includes(i)) {
            m.Imports = m.Imports.filter(x => x !== i);
          }
        })
      })
    })
  }

  getDependecies(project: string): Array<string> {
    const levels: any = {};
    this.getParent(this.Projects.find(x => x.Name === project) as AngularProject, 10, levels);
    const l = Object.keys(levels)
      .map(x => ({ name: x, level: levels[x].level }))
      .sort((a, b) => {
        if (a.level < b.level) { return -1 }
        if (a.level > b.level) { return 1 }
        return 0;
      }).map(x => x.name)
    return l;
  }

  createDependecies() {
    this.Projects.forEach(p => {
      const processed = new Array<string>();
      p.Imports.forEach(i => {
        const pr = this.Projects.find(x => x.Name === i);
        if (pr) {
          p.Parents.push((pr as any));
          processed.push(i);
        }
      });
      p.Modules.forEach(m => {
        m.Imports.forEach(i => {
          if (!processed.includes(i)) {
            const pr = this.getModule(i);
            if (pr.project) {
              p.Parents.push((pr.project as any));
            }
          }
        })
      })
    })
  }

  getModule(name: string) {
    let project: AngularProject | null = null;
    let module: AngularModule | null = null;
    this.Projects.forEach(p => {
      p.Modules.forEach(m => {
        if (m.Name === name) {
          module = m;
          project = p;
        }
      })
    })
    return { module, project }
  }

  parse(ang: any) {
    Object.keys(ang.projects).forEach(key => {
      this.Projects.push(
        new AngularProject(key, path.join(this.Path, ang.projects[key].sourceRoot), ang.projects[key].projectType)
      )
    })
  }

  getCircularDeps(project: AngularProject | undefined, parsed: Array<string> = [], path: Array<string> = []) {
    if (!project) { return; }
    project.Parents
      .forEach(subproj => {
        if (path.length > path.filter((v, i, a) => a.indexOf(v) === i).length) {
          const deps = path.slice(-2);
          console.log(`Circular dependency found: ` + `${deps[0]} <-> ${deps[1]}`.red);
          process.exit();
        }
        parsed.push(path.concat([subproj.Name || 'empty']).join(':'));
        this.getCircularDeps(subproj, parsed, path.concat([subproj.Name]));
      });
  }

  getParent(obj: AngularProject, level: number, levels: any) {
    if (!levels[obj.Name]) {
      levels[obj.Name] = { level };
    }
    if (levels[obj.Name].level >= level) {
      levels[obj.Name].level = level;
    }

    if (obj.Parents.length > 0) {
      obj.Parents.forEach((p: any) => {
        if ((p as AngularProject).Name !== obj.Name) {
          this.getParent(p, level - 1, levels);
        }
      });
    }
  }
}

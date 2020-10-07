import jsonfile from "jsonfile";
import path from "path";
import fs from "fs";
import { AngularModule } from "./angular.module.parser";
import { AngularProject } from "./angular.project";
import { Angular } from "./angular";

const regex = /@NgModule\(\{[\s|\S]*imports\:([\s|\S]*?\]\,)[\S|\s]*\}\)[\s|\S]*export class (.*)\{/gim;
const regexBody = /((imports|declarations|bootstrap|entryComponents)\:[\s|\S]*?\[[\s|\S]*?\][\,|\n])/gim;
const regexImports = /(import\ (.*|\n)?\ from\ (.*)?\;+)/gim;
const regexImportsMl = /(import[\s|\S]*?\;|(?=\n.*?;|\z))/gim;

export class AngularParser {
  public Modules = new Array<AngularModule>();
  public Projects = new Array<AngularProject>();

  constructor(private Path: string) {
    new Angular(Path);
    this.parse(Angular.instance.ang);
    this.sanitize();
    this.createDependecies();
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

  getParent(obj: AngularProject, level: number, levels: any) {
    if (!levels[obj.Name]) {
      levels[obj.Name] = { level };
    }
    if (levels[obj.Name].level > level) {
      levels[obj.Name].level = level;
    }
    if (obj.Parents.length > 0) {
      obj.Parents.forEach((p: any) => {
        this.getParent(p, level - 1, levels);
      });
    }
  }
}

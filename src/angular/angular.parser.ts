import jsonfile from "jsonfile";
import path from "path";
import fs from "fs";
import { AngularModule } from "./angular.module.parser";
import { AngularProject } from "./angular.project";

const regex = /@NgModule\(\{[\s|\S]*imports\:([\s|\S]*?\]\,)[\S|\s]*\}\)[\s|\S]*export class (.*)\{/gim;
const regexBody = /((imports|declarations|bootstrap|entryComponents)\:[\s|\S]*?\[[\s|\S]*?\][\,|\n])/gim;
const regexImports = /(import\ (.*|\n)?\ from\ (.*)?\;+)/gim;
const regexImportsMl = /(import[\s|\S]*?\;|(?=\n.*?;|\z))/gim;

export class AngularParser {
  public Modules = new Array<AngularModule>();
  public Structure: any = {};
  public Levels: any = {};
  public Projects = new Array<AngularProject>();

  constructor(private Path: string) {
    const ang = jsonfile.readFileSync(path.join(this.Path, "angular.json"));
    this.parse(ang);
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
    this.createDependecies();

    const levels: any = {};
    this.getParent(this.Projects.find(x => x.Name === 'dash') as AngularProject, 10, levels);
    const l = Object.keys(levels)
      .map(x => ({ name: x, level: levels[x].level }))
      .sort((a, b) => {
        if (a.level < b.level) { return -1 }
        if (a.level > b.level) { return 1 }
        return 0;
      }).map(x => x.name)
    console.log(JSON.stringify(l));
    // console.log(JSON.stringify(this.Projects.find(x => x.Name === 'dash'), null, 2));
  }

  createDependecies() {
    this.Projects.forEach(p => {
      p.Modules.forEach(m => {
        m.Imports.forEach(i => {
          const pr = this.getModule(i);
          if (pr.project) {
            // (pr.project as any).Children.push(p);
            p.Parents.push((pr.project as any));
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

    this.sanitize();
    // console.log(JSON.stringify(this.Projects, null, 2));

    const projects = Object.keys(ang.projects)
      .map((key) => ({
        name: key,
        root: ang.projects[key].sourceRoot,
        type: ang.projects[key].projectType,
      }));

    projects.forEach((lib) => {
      this.Structure[lib.name] = {
        name: lib.name,
        modules: new Array<string>(),
        imports: new Array<string>(),
        deps: new Array<string>(),
        parent: new Array<any>(),
        children: new Array<any>(),
      };
      this.getDir(
        path.join(this.Path, lib.root),
        this.Structure[lib.name].modules,
        this.Structure[lib.name].imports
      );
    });

    Object.keys(this.Structure).forEach((key) => {
      const totalImport = this.Structure[key].imports.join(".");
      Object.keys(this.Structure).forEach((pkey) => {
        if (pkey !== key) {
          this.Structure[pkey].modules.forEach((mod: any) => {
            const imports = totalImport.includes(mod);
            if (imports) {
              this.Structure[key].deps.push(mod);
            }
          });
        }
      });
      delete this.Structure[key].imports;
    });

    const modules = Object.keys(this.Structure).map((x) => this.Structure[x]);
    modules.forEach((module: any, index, array) => {
      array.forEach((s) => {
        s.modules.forEach((m: string) => {
          if (module.deps.join(",").includes(m)) {
            if (s.name !== module.name && !module.modules.includes(m)) {
              module.parent.push(s);
            }
          }
        });
      });
    });

    modules.forEach(
      (m) =>
        (m.parent = m.parent.filter(
          (item: any, i: any, ar: string | any[]) => ar.indexOf(item) === i
        ))
    );

    const sorted = modules
      .sort((a, b) => {
        if (a.parent.length === 0 && b.parent.length > 0) {
          return -1;
        }
        if (b.parent.length === 0 && a.parent.length > 0) {
          return 1;
        }
        return 0;
      })
      .map((a: any) => ({
        name: a.name,
        parent: a.parent,
        children: new Array<any>(),
      }));

    sorted.forEach((s: any, index, array: Array<any>) => {
      s.parent.forEach((p: any) => {
        array.find((x: any) => x.name === p.name).children.push(s);
      });
    });

    // sorted
    //   .filter((x) => x.parent.length === 0)
    //   .forEach((x) => this.getChildren(x, 0));

    // this.getParent(
    //   sorted.find((x) => x.name === "bi"),
    //   10
    // );

    const l = Object.keys(this.Levels)
      .map((x) => ({ name: x, level: this.Levels[x].level }))
      .sort((a, b) => {
        if (a.level < b.level) {
          return -1;
        }
        if (a.level > b.level) {
          return 1;
        }
        return 0;
      });
    console.log(JSON.stringify(l, null, 2));
  }

  getChildren(obj: any, level: number) {
    if (!this.Levels[obj.name]) {
      this.Levels[obj.name] = { level };
    }
    if (this.Levels[obj.name].level < level) {
      this.Levels[obj.name].level = level;
    }
    console.log(Array(level * 3).join(" ") + obj.name);
    if (obj.children.length > 0) {
      obj.children.forEach((o: any) => this.getChildren(o, level + 1));
    }
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

  getDir(dir: string, list: Array<string>, imports: Array<string>) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    files.forEach((f) => {
      if (f.isDirectory()) {
        this.getDir(path.join(dir, f.name), list, imports);
      } else {
        const ff = fs.readFileSync(path.join(dir, f.name)).toString();
        const ret = regex.exec(ff);
        this.Modules.push(new AngularModule(ff));
        if (ret) {
          if (ret[1]) {
            imports.push(ret[1]);
          }
          if (ret[2]) {
            list.push(ret[2].trim());
          }
        }
      }
    });
  }
}

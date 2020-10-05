import jsonfile from "jsonfile";
import path from "path";
import fs from "fs";

const regex = /@NgModule\(\{[\s|\S]*imports\:([\s|\S]*?\]\,)[\S|\s]*\}\)[\s|\S]*export class (.*)\{/gim;

export class AngularParser {
  public Structure: any = {};
  public Levels: any = {};
  constructor(private Path: string) {
    const ang = jsonfile.readFileSync(path.join(this.Path, "angular.json"));
    this.parse(ang);
  }

  parse(ang: any) {
    const projects = Object.keys(ang.projects)
      .filter((key) => key !== "bi")
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
    // .filter((a) => a.parent.length !== 0 || a.children.length !== 0);
    sorted.forEach((s: any, index, array: Array<any>) => {
      s.parent.forEach((p: any) => {
        array.find((x: any) => x.name === p.name).children.push(s);
      });
    });

    // sorted
    //   .filter((x) => x.parent.length === 0)
    //   .forEach((x) => this.getChildren(x, 0));

    this.getParent(
      sorted.find((x) => x.name === "site"),
      10
    );

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
    console.log(JSON.stringify(l));
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

  getParent(obj: any, level: number) {
    if (!this.Levels[obj.name]) {
      this.Levels[obj.name] = { level };
    }
    if (this.Levels[obj.name].level > level) {
      this.Levels[obj.name].level = level;
    }
    if (obj.parent.length > 0) {
      obj.parent.forEach((p: any) => {
        this.getParent(p, level - 1);
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

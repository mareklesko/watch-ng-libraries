import jsonfile from "jsonfile";
import path from "path";
import fs from "fs";

const regex = /@NgModule\(\{[\s|\S]*imports\:([\s|\S]*?\]\,)[\S|\s]*\}\)[\s|\S]*export class (.*)\{/gim;

export class AngularParser {
  public Structure: any = {};
  constructor(private Path: string) {
    const ang = jsonfile.readFileSync(path.join(this.Path, "angular.json"));
    this.parse(ang);
  }

  parse(ang: any) {
    Object.keys(ang.projects)
      .filter((key) => ang.projects[key].projectType === "library")
      .map((key) => ({ name: key, root: ang.projects[key].sourceRoot }))
      .forEach((lib) => {
        this.Structure[lib.name] = {
          name: lib.name,
          modules: new Array<string>(),
          imports: new Array<string>(),
          deps: new Array<string>(),
          parent: new Array<any>(),
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
            module.parent.push(s.name);
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

    const sorted = new Array<any>();
    modules.forEach((a: any) => {});
    console.log(
      JSON.stringify(sorted.map((x) => ({ name: x.name, parent: x.parent })))
    );
    // this.Structure.console.log(JSON.stringify(this.Structure));
  }
  getDir(dir: string, list: Array<string>, imports: Array<string>) {
    // console.log(dir);
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
          list.push(ret[2].trim());
        }
      }
    });
  }
}

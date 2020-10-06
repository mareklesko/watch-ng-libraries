
const moduleParser = /@NgModule\(\{[\s|\S]*imports\:([\s|\S]*?\]\,)[\S|\s]*\}\)[\s|\S]*export class (.*)\{/gmi;
const moduleBodyParser = /((imports|declarations|bootstrap|entryComponents)\:[\s|\S]*?\[[\s|\S]*?\][\,|\n])/gim;
const importParser = /(import\ (.*|\n)?\ from\ (.*)?\;+)/gim;
const importsMultilineParser = /(import[\s|\S]*?\;|(?=\n.*?;|\z))/gim;

export class AngularModule {
    public Imports = new Array<string>()
    public Declarations = new Array<string>();
    public Name: string = "";

    constructor(body: string) {


        let m;
        while ((m = moduleParser.exec(body)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === moduleParser.lastIndex) {
                moduleParser.lastIndex++;
            }

            // The result can be accessed through the `m`-variable.
            m.forEach((match, groupIndex) => {
                // console.log(`Found match, group ${groupIndex}: ${match}`);
            });

            this.Name = m[2].trim();
            this.Imports = this.Imports.concat(m[1]
                .trim()
                .replace(/\r?\n|\r/g, ' ')
                .replace('[', '')
                .replace(']', '')
                .split(',')
                .map((x: string) => x.trim())
                .filter((x: string) => x !== '' && !x.includes('//')));
        }
    }
}
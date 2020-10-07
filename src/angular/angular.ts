import jsonfile from 'jsonfile';
import path from 'path';

export class Angular {
    static instance: Angular
    public ang: any;
    constructor(private Path: string) {
        Angular.instance = this;
        this.ang = jsonfile.readFileSync(path.join(this.Path, "angular.json"));
    }
}

import { EventEmitter } from "events";
import * as childProcess from "child_process";
import { IProcess, STATUS_DONE, STATUS_ERROR, STATUS_WARNING, STATUS_WORKING } from "../process.interface";
import { ProcessBase } from "../process.base";

export class BuildProcess extends ProcessBase {
    public Events = [
        { Event: STATUS_DONE, Exp: new RegExp('Built Angular Package') },
        { Event: STATUS_DONE, Exp: new RegExp('chunk') },
        { Event: STATUS_DONE, Exp: new RegExp('bundle generation complete') },
        { Event: STATUS_DONE, Exp: new RegExp('bundle generation complete') },
        { Event: STATUS_WORKING, Exp: new RegExp('Building Angular Package') },
        { Event: STATUS_ERROR, Exp: new RegExp('(ERROR)(.*?)\:(.*)?\:(.*)?\-(.*?)\:(.*)') },
        { Event: STATUS_ERROR, Exp: new RegExp('unandled|exception') },
        { Event: STATUS_WARNING, Exp: new RegExp('(WARNING)\:(.*?)\:(.*)?\:(.*)?\-(.*?)\:(.*)') }
    ]
    public Type = 'Build';

    constructor(public Name: string, private Path: string, private buildOptions: any = [], private Memory: number = 2048) {
        super();
    }

    public Start(): IProcess {
        this.Spawn = childProcess.spawn(
            'node',
            [`--max-old-space-size=${this.Memory}`, './node_modules/@angular/cli/bin/ng', 'build', this.Name].concat(this.buildOptions),
            { cwd: this.Path, shell: true, stdio: 'pipe', }
        );
        this.AttachListeners();
        return this;
    }
}
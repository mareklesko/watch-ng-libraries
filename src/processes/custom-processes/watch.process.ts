import * as childProcess from "child_process";
import { IProcess, STATUS_DONE, STATUS_ERROR, STATUS_WORKING } from "../process.interface";
import { BehaviorSubject, Observable } from "rxjs";
import { ProcessBase } from "../process.base";

export class WatchProcess extends ProcessBase {
    Events = [
        { Event: STATUS_DONE, Exp: new RegExp('Compilation complete. Watching for file changes...') },
        { Event: STATUS_WORKING, Exp: new RegExp('Building Angular Package') },
        { Event: STATUS_WORKING, Exp: new RegExp('File change detected. Starting incremental compilation') },
        { Event: STATUS_ERROR, Exp: new RegExp('(ERROR)\:(.*?)\:(.*)?\:(.*)?\-(.*?)\:(.*)') },
        { Event: STATUS_ERROR, Exp: new RegExp('ERROR') }
    ];
    Type = 'Watch';
    constructor(public Name: string, private Path: string) {
        super();
    }

    Start(): any {
        this.Spawn = childProcess.spawn(
            'node',
            ['./node_modules/@angular/cli/bin/ng',
            'build', this.Name, '--watch'],
            { cwd: this.Path, shell: true }
        );
        this.AttachListeners();
        return this;
    }
}
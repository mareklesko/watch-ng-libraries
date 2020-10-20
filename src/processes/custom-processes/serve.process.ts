import { EventEmitter } from "events";
import * as childProcess from "child_process";
import { IProcess, STATUS_DONE, STATUS_ERROR, STATUS_WARNING, STATUS_WORKING } from "../process.interface";
import readline from 'readline';
import tty from 'tty';
import { BehaviorSubject, Observable } from "rxjs";
import { ProcessBase } from "../process.base";




export class ServeProcess extends ProcessBase {
    Events = [
        { Event: STATUS_DONE, Exp: new RegExp('Compiled successfully') },
        { Event: STATUS_WORKING, Exp: new RegExp('0\%') },
        { Event: STATUS_WORKING, Exp: new RegExp('building') },
        { Event: STATUS_ERROR, Exp: new RegExp('(ERROR)(.*?)\:(.*)?\:(.*)?\-(.*?)\:(.*)') },
        { Event: STATUS_WARNING, Exp: new RegExp('(WARNING)\:(.*?)\:(.*)?\:(.*)?\-(.*?)\:(.*)') }
    ];
    Type = 'Serve';
    Port: number | undefined;
    private BuildOptions: Array<string>;
    constructor(public Name: string, private Path: string, private Detached: boolean | null, buildOptions: Array<string> = []) {
        super();
        this.BuildOptions = buildOptions ? buildOptions : [];
    }

    Start(port: number = 0): any {
        this.Port = port;
        this.Spawn = childProcess.spawn(
            'ng',
            ['serve', this.Name, `--port ${port}`].concat(this.BuildOptions),
            { detached: this.Detached ? this.Detached : false, cwd: this.Path, shell: true, stdio: 'pipe', }
        );
        this.AttachListeners();
        this.Status.next({ Type: STATUS_WORKING, Message: STATUS_WORKING });
        return this;
    }
}
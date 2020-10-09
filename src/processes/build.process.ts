import { EventEmitter } from "events";
import * as childProcess from "child_process";
import { IProcess } from "./process.interface";
import readline from 'readline';
import tty from 'tty';
import { BehaviorSubject, Observable } from "rxjs";

const events = [
    { Event: 'Build', Exp: new RegExp('Built Angular Package') },
    { Event: 'Build', Exp: new RegExp('chunk') },
    { Event: 'Build', Exp: new RegExp('bundle generation complete') },
    { Event: 'Building', Exp: new RegExp('Building Angular Package') },
    { Event: 'Error', Exp: new RegExp('(ERROR)(.*?)\:(.*)?\:(.*)?\-(.*?)\:(.*)') },
    { Event: 'Warning', Exp: new RegExp('(WARNING)\:(.*?)\:(.*)?\:(.*)?\-(.*?)\:(.*)') }
]


export class BuildProcess implements IProcess {
    public Spawn: childProcess.ChildProcessWithoutNullStreams | undefined;
    public Type = 'Build';
    public Console = new BehaviorSubject<string>("\r");
    public Status = new EventEmitter();
    public Port: number | undefined;

    constructor(public Name: string, private Path: string, private buildOptions: any = []) {
    }

    public start(port: number = 0): any {
        this.Port = port;
        this.Spawn = childProcess.spawn(
            'ng',
            ['build', this.Name, `--prod`].concat(this.buildOptions),
            { cwd: this.Path, shell: true, stdio: 'pipe', }
        );
        this.Spawn.stdout.on("error", (err) => this.process_status(err));
        this.Spawn.stdout.on("data", (data) => this.process_status(data));
        this.Spawn.stderr.on("data", (data) => this.process_status(data));
        this.Status.emit("Changed", { Name: this.Name, Event: `Building` });
        return this;
    }

    private process_status(data: any) {
        const parsedData = data.toString();
        this.Console.next(parsedData);
        events.forEach(x => {
            if (x.Exp.test(parsedData)) {
                if (x.Event === 'Error') {
                    try {
                        const res = x.Exp.exec(parsedData);
                        if (res) {
                            this.Status.emit('Changed', {
                                Name: this.Name, Event: x.Event, Data: {
                                    Message: res[0], File: res[2].trim(), Line: Number.parseInt(res[3]), Column: Number.parseInt(res[4]), TsError: res[5].trim(), ErrorMessage: res[6].trim()
                                }
                            });
                        }
                    }
                    catch { }
                } else {
                    this.Status.emit('Changed', { Name: this.Name, Event: x.Event });
                }
            }
        })
    }
}
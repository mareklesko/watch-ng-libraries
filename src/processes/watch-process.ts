import { EventEmitter } from "events";
import * as childProcess from "child_process";
import { IProcess } from "./process.interface";

const events = [
    { Event: 'Compiled', Exp: new RegExp('Compilation complete. Watching for file changes...') },
    { Event: 'Started', Exp: new RegExp('Building Angular Package') },
    { Event: 'Recompiling', Exp: new RegExp('File change detected. Starting incremental compilation') },
    { Event: 'Error', Exp: new RegExp('(ERROR)\:(.*?)\:(.*)?\:(.*)?\-(.*?)\:(.*)') }
]


export class WatchProcess implements IProcess {
    private Spawn: childProcess.ChildProcessWithoutNullStreams | undefined;
    Type = 'Watch';
    public Status = new EventEmitter();
    constructor(public Name: string) {

    }

    public start(): any {
        this.Spawn = childProcess.spawn('ng', ['build', this.Name, '--watch'], { shell: true });
        this.Spawn.addListener("error", (err) => console.error(err));
        this.Spawn.stdout.on("data", (data) => this.process_status(data));
        this.Spawn.stderr.on("data", (data) => this.process_status(data));
        this.Status.emit("Changed", { Name: this.Name, Event: 'Initialized' });
        return this;
    }

    private process_status(data: any) {
        const parsedData = data.toString();
        events.forEach(x => {
            if (x.Exp.test(parsedData)) {
                if (x.Event === 'Error') {
                    const res = x.Exp.exec(parsedData) || [];
                    this.Status.emit('Changed', {
                        Name: this.Name, Event: x.Event, Data: {
                            Message: res[0], File: res[2].trim(), Line: Number.parseInt(res[3]), Column: Number.parseInt(res[4]), TsError: res[5].trim(), ErrorMessage: res[6].trim()
                        }
                    });
                } else {
                    this.Status.emit('Changed', { Name: this.Name, Event: x.Event });
                }
            }
        })
    }
}
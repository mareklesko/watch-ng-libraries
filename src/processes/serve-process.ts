import { EventEmitter } from "events";
import * as childProcess from "child_process";
import { IProcess } from "./process.interface";
import readline from 'readline';
import tty from 'tty';

const events = [
    { Event: 'Compiled', Exp: new RegExp('Compiled successfully') },
    { Event: 'Started', Exp: new RegExp('0\%') },
    { Event: 'Recompiling', Exp: new RegExp('building') },
    { Event: 'Error', Exp: new RegExp('(ERROR)(.*?)\:(.*)?\:(.*)?\-(.*?)\:(.*)') },
    { Event: 'Warning', Exp: new RegExp('(WARNING)\:(.*?)\:(.*)?\:(.*)?\-(.*?)\:(.*)') }
]


export class ServeProcess implements IProcess {
    private Spawn: childProcess.ChildProcessWithoutNullStreams | undefined;
    public Type = 'Serve';
    public Status = new EventEmitter();
    public Port: number | undefined;

    constructor(public Name: string, private Path: string, private Detached: boolean | null) {
    }

    public start(port: number = 0): any {
        this.Port = port;
        this.Spawn = childProcess.spawn(
            'ng',
            ['serve', this.Name, `--port ${port}`],
            { detached: this.Detached ? this.Detached : false, cwd: this.Path, shell: true, stdio: 'pipe', }
        );
        this.Spawn.stdout.on("error", (err) => this.process_status(err));
        this.Spawn.stdout.on("data", (data) => this.process_status(data));
        this.Spawn.stderr.on("data", (data) => this.process_status(data));
        this.Status.emit("Changed", { Name: this.Name, Event: `Initialized on port ${port}` });
        return this;
    }

    private process_status(data: any) {
        const parsedData = data.toString();
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
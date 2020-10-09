import { IEvent, IProcess, IStatus, STATUS_PENDING } from "./process.interface";
import * as childProcess from "child_process";
import { EventEmitter } from "events";
import { BehaviorSubject } from "rxjs";

export abstract class ProcessBase implements IProcess {
    Events = new Array<IEvent>();
    Spawn: childProcess.ChildProcessWithoutNullStreams | undefined;
    abstract Name: string;
    Status = new BehaviorSubject<IStatus>({ Type: '', Message: '' });
    Console = new BehaviorSubject<string>('');
    Type: string = "";
    Output = new Array<string>();

    AttachListeners() {
        if (this.Spawn) {
            this.Spawn.stdout.on("error", (data) => this.ProcessStatus(data));
            this.Spawn.stdout.on("data", (data) => this.ProcessStatus(data));
            this.Spawn.stderr.on("data", (data) => this.ProcessStatus(data));
            this.Spawn.stderr.on("error", (data) => this.ProcessStatus(data));
            this.Status.next({ Type: STATUS_PENDING, Message: STATUS_PENDING });
        }
    }
    abstract Start(port?: number): IProcess;

    ProcessStatus(data: any) {
        const parsedData = data.toString();
        this.Console.next(parsedData);
        this.Output.push(parsedData);
        this.Events.forEach((x: IEvent) => {
            if (x.Exp.test(parsedData)) {
                if (x.Event === 'Error') {
                    try {
                        const res = x.Exp.exec(parsedData);
                        if (res) {
                            this.Status.next({
                                Type: x.Event,
                                Message: res[0],
                                Error: {
                                    Message: res[0], File: res[2].trim(), Line: Number.parseInt(res[3]), Column: Number.parseInt(res[4]), TsError: res[5].trim(), ErrorMessage: res[6].trim()
                                }
                            });
                        }
                    }
                    catch { }
                } else {
                    this.Status.next({
                        Type: x.Event,
                        Message: x.Event
                    });
                }
            }
        })
    }

}
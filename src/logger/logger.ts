import { fromEvent } from "rxjs";
import { IEvent, IProcess, IStatus, STATUS_DONE, STATUS_ERROR, STATUS_WARNING, STATUS_WORKING } from "../processes/process.interface";
import colors from 'colors';

export class Logger {
    static instance: Logger
    private LogObject: any = {};
    private previousError: any = { lines: [] };
    private initialRun = true;

    constructor(private Items: Array<IProcess>) {
        Logger.instance = this;
        Items.forEach(x => x.Status.subscribe(d => this.log(x.Name, d)));
        Items.forEach(x => this.LogObject[x.Name] = colors.white(`[${new Date().toLocaleTimeString()}] ${x.Name} Pending...`));
    }

    log(name: string, data: IStatus | null) {
        if (!this.initialRun) {
            this.cleanup();
        } else {
            this.initialRun = false;
        }
        let output: string;
        let err = { name: null as any, lines: new Array<string>() };
        if (this.previousError.name !== name) {
            err = this.previousError;
        }
        switch (data?.Type) {
            case STATUS_ERROR:
                output = colors.red(`[${new Date().toLocaleTimeString()}] ${name}: ${data?.Message}`);
                err.lines = Object.keys(data?.Error).map(x => colors.red(`${x}: ${data.Error[x]}`));
                err.name = name;
                break;
            case STATUS_WORKING:
            case STATUS_WARNING:
                output = colors.yellow(`[${new Date().toLocaleTimeString()}] ${name}: ${data.Message}`);
                break;
            case STATUS_DONE:
                output = colors.green(`[${new Date().toLocaleTimeString()}] ${name}: ${data.Message}`);
                break;
            default:
                output = colors.white(`[${new Date().toLocaleTimeString()}] ${name}: ${data?.Message}`);
                break;
        }

        this.LogObject[name] = output;

        Object.keys(this.LogObject).forEach(key => {
            console.log(
                this.LogObject[key] + Array(process.stdout.columns - this.LogObject[key].length).fill('').join(' ')
            );
        });
        if (err.lines.length > 0) { console.log(err.lines.join('\n\r')); }
        this.previousError = err;
    }

    cleanup() {
        process.stdout.write(Array(this.Items.length + this.previousError.lines.length).fill('\x1b[1A').join(''));
        console.log(Array(this.previousError.lines.length + this.Items.length).fill(Array(process.stdout.columns).fill(' ').join('')).join('\n\r'));
        process.stdout.write(Array(this.Items.length + this.previousError.lines.length).fill('\x1b[1A').join(''));
    }
}


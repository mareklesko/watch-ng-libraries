import { fromEvent } from "rxjs";
import { IProcess } from "../processes/process.interface";
import colors from 'colors';

export class Logger {
    static instance: Logger
    private LogObject: any = {};
    private previousError: any = { lines: [] };
    private initialRun = true;

    constructor(private Items: Array<IProcess>) {
        Logger.instance = this;
        Items.forEach(x => fromEvent(x.Status, 'Changed').subscribe(d => this.log(x.Name, d)));
        Items.forEach(x => this.LogObject[x.Name] = colors.white(`[${new Date().toLocaleTimeString()}] ${x.Name} Pending...`));
    }

    log(name: string, data: any) {
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
        switch (data.Event) {
            case 'Error':
            case 'UndefinedError':
                output = colors.red(`[${new Date().toLocaleTimeString()}] ${data.Name}: ${data.Event}`);
                err.lines = Object.keys(data.Data).map(x => colors.red(`${x}: ${data.Data[x]}`));
                err.name = name;
                break;
            case 'Recompiling':
            case 'Started':
                output = colors.yellow(`[${new Date().toLocaleTimeString()}] ${data.Name}: ${data.Event}`);
                break;
            case 'Compiled':
                output = colors.green(`[${new Date().toLocaleTimeString()}] ${data.Name}: ${data.Event}`);
                break;
            default:
                output = colors.white(`[${new Date().toLocaleTimeString()}] ${data.Name}: ${data.Event}`);
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


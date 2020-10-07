import { IProcess } from "../processes/process.interface";
export declare class Logger {
    private Items;
    static instance: Logger;
    private LogObject;
    private previousError;
    private initialRun;
    constructor(Items: Array<IProcess>);
    log(name: string, data: any): void;
    cleanup(): void;
}

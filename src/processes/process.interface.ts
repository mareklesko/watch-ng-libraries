import { EventEmitter } from "events";
import * as childProcess from "child_process";
import { BehaviorSubject, Observable } from "rxjs";

export interface IProcess {
    Events: Array<IEvent>;
    Spawn: childProcess.ChildProcessWithoutNullStreams | undefined;
    Name: string;
    Status: BehaviorSubject<IStatus>;
    Console: BehaviorSubject<string>;
    Type: string;
    Start: (n?: number) => IProcess;
    Output: Array<string>;
}

export interface IEvent {
    Event: string;
    Exp: RegExp;
}

export interface IStatus {
    Type: string;
    Message: string;
    Error?: any;
}

export const STATUS_DONE = "Done";
export const STATUS_WORKING = "Working...";
export const STATUS_STARTING = "Starting...";
export const STATUS_PENDING = "Pending...";
export const STATUS_ERROR = "Error";
export const STATUS_WARNING = "Warning";
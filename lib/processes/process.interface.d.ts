/// <reference types="node" />
import * as childProcess from "child_process";
import { BehaviorSubject } from "rxjs";
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
export declare const STATUS_DONE = "Done";
export declare const STATUS_WORKING = "Working...";
export declare const STATUS_STARTING = "Starting...";
export declare const STATUS_PENDING = "Pending...";
export declare const STATUS_ERROR = "Error";
export declare const STATUS_WARNING = "Warning";

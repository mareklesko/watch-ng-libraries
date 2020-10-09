/// <reference types="node" />
import { EventEmitter } from "events";
import * as childProcess from "child_process";
import { IProcess } from "./process.interface";
import { BehaviorSubject } from "rxjs";
export declare class WatchProcess implements IProcess {
    Name: string;
    private Path;
    Spawn: childProcess.ChildProcessWithoutNullStreams | undefined;
    Type: string;
    Console: BehaviorSubject<string>;
    Status: EventEmitter;
    constructor(Name: string, Path: string);
    start(): any;
    private process_status;
}

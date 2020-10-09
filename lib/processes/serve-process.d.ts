/// <reference types="node" />
import { EventEmitter } from "events";
import * as childProcess from "child_process";
import { IProcess } from "./process.interface";
import { BehaviorSubject } from "rxjs";
export declare class ServeProcess implements IProcess {
    Name: string;
    private Path;
    private Detached;
    Spawn: childProcess.ChildProcessWithoutNullStreams | undefined;
    Console: BehaviorSubject<string>;
    Type: string;
    Status: EventEmitter;
    Port: number | undefined;
    constructor(Name: string, Path: string, Detached: boolean | null);
    start(port?: number): any;
    private process_status;
}

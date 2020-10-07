/// <reference types="node" />
import { EventEmitter } from "events";
import { IProcess } from "./process.interface";
export declare class ServeProcess implements IProcess {
    Name: string;
    private Path;
    private Detached;
    private Spawn;
    Type: string;
    Status: EventEmitter;
    Port: number | undefined;
    constructor(Name: string, Path: string, Detached: boolean | null);
    start(port?: number): any;
    private process_status;
}

/// <reference types="node" />
import { EventEmitter } from "events";
import { IProcess } from "./process.interface";
export declare class ServeProcess implements IProcess {
    Name: string;
    private Spawn;
    Type: string;
    Status: EventEmitter;
    Port: number | undefined;
    constructor(Name: string);
    start(port?: number): any;
    private process_status;
}

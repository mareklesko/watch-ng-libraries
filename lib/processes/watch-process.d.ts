/// <reference types="node" />
import { EventEmitter } from "events";
import { IProcess } from "./process.interface";
export declare class WatchProcess implements IProcess {
    Name: string;
    private Spawn;
    Type: string;
    Status: EventEmitter;
    constructor(Name: string);
    start(): any;
    private process_status;
}

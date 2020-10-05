/// <reference types="node" />
import { EventEmitter } from "events";
export interface IProcess {
    Name: string;
    Status: EventEmitter;
    Type: string;
    start: (n?: number) => void;
}

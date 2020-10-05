import { EventEmitter } from "events";
import { start } from "repl";

export interface IProcess {
    Name: string;
    Status: EventEmitter;
    Type: string;
    start: (n?: number) => void;
}
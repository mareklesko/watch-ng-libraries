import { EventEmitter } from "events";
import * as childProcess from "child_process";
import { BehaviorSubject, Observable } from "rxjs";

export interface IProcess {
    Spawn: childProcess.ChildProcessWithoutNullStreams | undefined;
    Name: string;
    Status: EventEmitter;
    Console: BehaviorSubject<string>;
    Type: string;
    start: (n?: number) => void;
}
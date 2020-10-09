import { ProcessBase } from "./process.base";
export declare class ServeProcess extends ProcessBase {
    Name: string;
    private Path;
    private Detached;
    Events: {
        Event: string;
        Exp: RegExp;
    }[];
    Type: string;
    Port: number | undefined;
    constructor(Name: string, Path: string, Detached: boolean | null);
    Start(port?: number): any;
}

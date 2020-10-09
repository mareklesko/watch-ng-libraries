import { ProcessBase } from "./process.base";
export declare class WatchProcess extends ProcessBase {
    Name: string;
    private Path;
    Events: {
        Event: string;
        Exp: RegExp;
    }[];
    Type: string;
    constructor(Name: string, Path: string);
    Start(): any;
}

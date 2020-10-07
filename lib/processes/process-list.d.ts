import { IProcess } from "./process.interface";
export declare class ProcessList extends Array<IProcess> {
    private detached;
    constructor(libraries: Array<string>, project: string, path: string, detached: boolean);
}

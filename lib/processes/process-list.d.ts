import { IProcess } from "./process.interface";
export declare class ProcessList extends Array<IProcess> {
    constructor(libraries: Array<string>, project: string, path: string, detached: boolean, build: boolean, buildOptions: any, verbose: boolean);
}

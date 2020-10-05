import { IProcess } from "./process.interface";
export declare class ProcessList extends Array<IProcess> {
    constructor(libraries: Array<string>, projects: Array<string>);
}

import fs from "fs";
import { AngularProjectv11Module } from "./angular.module";
import path from 'path';

export class AngularProjectv11 {
    public ReferencedModules = new Array<AngularProjectv11Module>();
    public Type: ProjectType;
    public Path: string;
    constructor(_path: string, configJunk: any) {
        this.Type = configJunk.projectType;
        this.Path = path.join(_path, configJunk.root);
    }
}

export enum ProjectType {
    APPLICATION = "application",
    LIBRARY = "library"
}
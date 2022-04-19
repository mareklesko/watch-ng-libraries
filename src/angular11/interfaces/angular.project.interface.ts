import { AngularProjectv11Module } from "../angular.module";

export interface IAngularProject {
    Name: string;
    Path: string;
    ExportedModules: Array<AngularProjectv11Module>;
    ReferencedProjects: Array<string>;
    References: Array<IAngularProject>;
    Level: number;
    readonly AllEntryPoints: Array<string>;
    readonly AllReferencedProjects: Array<string>;

    CreateReferences(projects: IAngularProject[]): void;
}

export const ModuleParser = /@NgModule\(\{[\s|\S]*imports\:([\s|\S]*?\]\,)[\S|\s]*\}\)[\s|\S]*export class (.*)\{/gmi;

export const ModuleNameParser = /@NgModule\([\s|\S]*export class (.*)\ \{/gmi;

export const ModuleTester = /@NgModule\(/gmi;

export const ImportsParser = /^\ *import (.*)from (.*?)\;/gm;
import { AngularProjectv11Base } from "./angular.project";
import { IAngularProject } from "./interfaces/angular.project.interface";

export class AngularSecondaryProjectv11 extends AngularProjectv11Base {
    public Parent: IAngularProject | undefined;
}
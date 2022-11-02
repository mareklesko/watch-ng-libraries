import { filter } from 'rxjs/operators';
import { Logger } from "../logger/logger";
import { BuildProcess } from "./custom-processes/build.process";
import { IProcess, IStatus, STATUS_DONE, STATUS_ERROR } from "./process.interface";
import { ServeProcess } from "./custom-processes/serve.process";
import { WatchProcess } from "./custom-processes/watch.process";

export class ProcessList extends Array<IProcess>
{
    constructor(libraries: Array<string>, project: string = "", path: string, detached: boolean, 
        build: boolean, buildOptions: any = [], verbose: boolean, memory: number, port: number = 4200) {
        super();
        if (build) {
            libraries.forEach(x => this.push(new BuildProcess(x, path)));
            if (project !== "") {
                this.push(new BuildProcess(project, path, buildOptions));
            }
        } else {
            libraries.forEach(x => this.push(new WatchProcess(x, path)));
            this.push(new ServeProcess(project, path, detached));
        }
        if (!verbose) {
            new Logger(this);
        } else {
            this.forEach(x => x.Console.subscribe((data) => console.log(data.trim())));
        }

        this.forEach(x => x.Status.pipe(
            filter((s: IStatus) => s.Type === STATUS_ERROR)
        ).subscribe((s: IStatus) => {

        }));

        this.filter(x => x.Type === 'Watch').forEach((x, index, array) => {
            const sub = x.Status
                .pipe(
                    filter((y: IStatus) => y.Type === STATUS_DONE),
                )
                .subscribe(d => {
                    if (array.length - 1 > index) {
                        array[index + 1].Start();
                        sub.unsubscribe();
                    }
                });

            if (index === 0) { x.Start(); }
            if (index === array.length - 1) {
                const sub = x.Status.pipe(
                    filter((y: IStatus) => y.Type === STATUS_DONE),
                ).subscribe(d => {
                    this.filter(x => x.Type === 'Serve').forEach((x, index) => x.Start(+port + index));
                    sub.unsubscribe();
                })
            }
        });

        if (this.filter(x => x.Type === 'Watch').length === 0) {
            this.filter(x => x.Type === 'Serve')
                .forEach((x, index) => x.Start(+port + index));
        }

        this.filter(x => x.Type === 'Build').forEach((x, index, array) => {
            const sub = x.Status
                .pipe(
                    filter((y: IStatus) => y.Type === STATUS_DONE),
                )
                .subscribe(d => {
                    if (array.length - 1 > index) {
                        array[index + 1].Start();
                        sub.unsubscribe();
                    }
                });

            if (index === 0) { x.Start(); }
        });
    }
}
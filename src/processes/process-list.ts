import { fromEvent } from "rxjs";
import { filter, tap } from 'rxjs/operators';
import { Logger } from "../logger/logger";
import { BuildProcess } from "./build.process";
import { IProcess } from "./process.interface";
import { ServeProcess } from "./serve-process";
import { WatchProcess } from "./watch-process";

export class ProcessList extends Array<IProcess>
{
    constructor(libraries: Array<string>, project: string, path: string, detached: boolean, build: boolean, buildOptions: any = [], verbose: boolean) {
        super();
        if (build) {
            libraries.forEach(x => this.push(new BuildProcess(x, path)));
            this.push(new BuildProcess(project, path, buildOptions));
        } else {
            libraries.forEach(x => this.push(new WatchProcess(x, path)));
            this.push(new ServeProcess(project, path, detached));
        }
        if (!verbose) {
            new Logger(this);
        } else {
            this.forEach(x => x.Console.subscribe((data) => console.log(data)))
        }

        this.filter(x => x.Type === 'Watch').forEach((x, index, array) => {
            const s = fromEvent(x.Status, 'Changed');
            const sub = s
                .pipe(
                    filter((y: any) => y.Event === 'Compiled'),
                )
                .subscribe(d => {
                    if (array.length - 1 > index) {
                        array[index + 1].start();
                        sub.unsubscribe();
                    }
                });

            if (index === 0) { x.start(); }
            if (index === array.length - 1) {
                const sub = s.pipe(
                    filter((y: any) => y.Event === 'Compiled'),
                ).subscribe(d => {
                    this.filter(x => x.Type === 'Serve').forEach((x, index) => x.start(4200 + index));
                    sub.unsubscribe();
                })
            }
        });

        if (this.filter(x => x.Type === 'Watch').length === 0) {
            this.filter(x => x.Type === 'Serve').forEach((x, index) => x.start(4200 + index));
        }

        this.filter(x => x.Type === 'Build').forEach((x, index, array) => {
            const s = fromEvent(x.Status, 'Changed');
            const sub = s
                .pipe(
                    filter((y: any) => y.Event === 'Build'),
                )
                .subscribe(d => {
                    if (array.length - 1 > index) {
                        array[index + 1].start();
                        sub.unsubscribe();
                    }
                });

            if (index === 0) { x.start(); }
        });

    }
}
import { fromEvent } from "rxjs";
import { filter, tap } from 'rxjs/operators';
import { log } from "../logger/logger";
import { IProcess } from "./process.interface";
import { ServeProcess } from "./serve-process";
import { WatchProcess } from "./watch-process";

export class ProcessList extends Array<IProcess>
{
    constructor(libraries: Array<string>, projects: Array<string>) {
        super();
        libraries.forEach(x => this.push(new WatchProcess(x)));
        projects.forEach(x => this.push(new ServeProcess(x)));

        this.forEach(s => fromEvent(s.Status, 'Changed').subscribe(d => log(d)));

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

    }
}
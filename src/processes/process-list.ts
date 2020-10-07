import { fromEvent } from "rxjs";
import { filter, tap } from 'rxjs/operators';
import { Logger } from "../logger/logger";
import { IProcess } from "./process.interface";
import { ServeProcess } from "./serve-process";
import { WatchProcess } from "./watch-process";

export class ProcessList extends Array<IProcess>
{
    constructor(libraries: Array<string>, project: string, path: string, private detached: boolean) {
        super();

        libraries.forEach(x => this.push(new WatchProcess(x, path)));
        this.push(new ServeProcess(project, path, detached));

        new Logger(this);

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
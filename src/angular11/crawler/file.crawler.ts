import fs from "fs";
import path from 'path';
import { IFileCrawlerOptions } from "./file.crawler.options";

export function Crawl(_path: string, options: IFileCrawlerOptions = { Extensions: [] }): string[] {

    if (typeof options.Extensions === 'string')
        options.Extensions = [options.Extensions];

    const items = fs.readdirSync(_path, { withFileTypes: true })

    const dirs = items
        .filter(x => x.isDirectory())
        .map(x => Crawl(path.join(_path, x.name), options))
        .reduce((tot, item) => tot = [...tot, ...item], [])

    return items.filter(x => x.isFile())
        .filter(x => options.Extensions.length > 0 ? options.Extensions?.includes(x.name.split('.').slice(-1)[0]) : true)
        .map(x => path.join(_path, x.name)).concat(dirs);
}
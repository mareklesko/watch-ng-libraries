"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
var rxjs_1 = require("rxjs");
var colors_1 = __importDefault(require("colors"));
var Logger = /** @class */ (function () {
    function Logger(Items) {
        var _this = this;
        this.Items = Items;
        this.LogObject = {};
        this.previousError = { lines: [] };
        this.initialRun = true;
        Logger.instance = this;
        Items.forEach(function (x) { return rxjs_1.fromEvent(x.Status, 'Changed').subscribe(function (d) { return _this.log(x.Name, d); }); });
        Items.forEach(function (x) { return _this.LogObject[x.Name] = colors_1.default.white("[" + new Date().toLocaleTimeString() + "] " + x.Name + " Pending..."); });
    }
    Logger.prototype.log = function (name, data) {
        var _this = this;
        if (!this.initialRun) {
            this.cleanup();
        }
        else {
            this.initialRun = false;
        }
        var output;
        var err = { name: null, lines: new Array() };
        if (this.previousError.name !== name) {
            err = this.previousError;
        }
        switch (data.Event) {
            case 'Error':
            case 'UndefinedError':
                output = colors_1.default.red("[" + new Date().toLocaleTimeString() + "] " + data.Name + ": " + data.Event);
                err.lines = Object.keys(data.Data).map(function (x) { return colors_1.default.red(x + ": " + data.Data[x]); });
                err.name = name;
                break;
            case 'Recompiling':
            case 'Started':
                output = colors_1.default.yellow("[" + new Date().toLocaleTimeString() + "] " + data.Name + ": " + data.Event);
                break;
            case 'Compiled':
                output = colors_1.default.green("[" + new Date().toLocaleTimeString() + "] " + data.Name + ": " + data.Event);
                break;
            default:
                output = colors_1.default.white("[" + new Date().toLocaleTimeString() + "] " + data.Name + ": " + data.Event);
                break;
        }
        this.LogObject[name] = output;
        Object.keys(this.LogObject).forEach(function (key) {
            console.log(_this.LogObject[key] + Array(process.stdout.columns - _this.LogObject[key].length).fill('').join(' '));
        });
        if (err.lines.length > 0) {
            console.log(err.lines.join('\n\r'));
        }
        this.previousError = err;
    };
    Logger.prototype.cleanup = function () {
        process.stdout.write(Array(this.Items.length + this.previousError.lines.length).fill('\x1b[1A').join(''));
        console.log(Array(this.previousError.lines.length + this.Items.length).fill(Array(process.stdout.columns).fill(' ').join('')).join('\n\r'));
        process.stdout.write(Array(this.Items.length + this.previousError.lines.length).fill('\x1b[1A').join(''));
    };
    return Logger;
}());
exports.Logger = Logger;

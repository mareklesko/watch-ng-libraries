"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WatchProcess = void 0;
var events_1 = require("events");
var childProcess = __importStar(require("child_process"));
var events = [
    { Event: 'Compiled', Exp: new RegExp('Compilation complete. Watching for file changes...') },
    { Event: 'Started', Exp: new RegExp('Building Angular Package') },
    { Event: 'Recompiling', Exp: new RegExp('File change detected. Starting incremental compilation') },
    { Event: 'Error', Exp: new RegExp('(ERROR)\:(.*?)\:(.*)?\:(.*)?\-(.*?)\:(.*)') }
];
var WatchProcess = /** @class */ (function () {
    function WatchProcess(Name) {
        this.Name = Name;
        this.Type = 'Watch';
        this.Status = new events_1.EventEmitter();
    }
    WatchProcess.prototype.start = function () {
        var _this = this;
        this.Spawn = childProcess.spawn('ng', ['build', this.Name, '--watch'], { cwd: 'C:\\Source\\Repos\\Iridium\\Modules\\ANG', shell: true });
        this.Spawn.addListener("error", function (err) { return console.error(err); });
        this.Spawn.stdout.on("data", function (data) { return _this.process_status(data); });
        this.Spawn.stderr.on("data", function (data) { return _this.process_status(data); });
        this.Status.emit("Changed", { Name: this.Name, Event: 'Initialized' });
        return this;
    };
    WatchProcess.prototype.process_status = function (data) {
        var _this = this;
        var parsedData = data.toString();
        events.forEach(function (x) {
            if (x.Exp.test(parsedData)) {
                if (x.Event === 'Error') {
                    var res = x.Exp.exec(parsedData) || [];
                    _this.Status.emit('Changed', {
                        Name: _this.Name, Event: x.Event, Data: {
                            Message: res[0], File: res[2].trim(), Line: Number.parseInt(res[3]), Column: Number.parseInt(res[4]), TsError: res[5].trim(), ErrorMessage: res[6].trim()
                        }
                    });
                }
                else {
                    _this.Status.emit('Changed', { Name: _this.Name, Event: x.Event });
                }
            }
        });
    };
    return WatchProcess;
}());
exports.WatchProcess = WatchProcess;

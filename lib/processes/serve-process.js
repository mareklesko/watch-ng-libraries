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
exports.ServeProcess = void 0;
var events_1 = require("events");
var childProcess = __importStar(require("child_process"));
var events = [
    { Event: 'Compiled', Exp: new RegExp('Compiled successfully') },
    { Event: 'Started', Exp: new RegExp('0\%') },
    { Event: 'Recompiling', Exp: new RegExp('building') },
    { Event: 'Error', Exp: new RegExp('(ERROR)(.*?)\:(.*)?\:(.*)?\-(.*?)\:(.*)') },
    { Event: 'Warning', Exp: new RegExp('(WARNING)\:(.*?)\:(.*)?\:(.*)?\-(.*?)\:(.*)') }
];
var ServeProcess = /** @class */ (function () {
    function ServeProcess(Name, Path, Detached) {
        this.Name = Name;
        this.Path = Path;
        this.Detached = Detached;
        this.Type = 'Serve';
        this.Status = new events_1.EventEmitter();
    }
    ServeProcess.prototype.start = function (port) {
        var _this = this;
        if (port === void 0) { port = 0; }
        this.Port = port;
        this.Spawn = childProcess.spawn('ng', ['serve', this.Name, "--port " + port], { detached: this.Detached ? this.Detached : false, cwd: this.Path, shell: true, stdio: 'pipe', });
        this.Spawn.stdout.on("error", function (err) { return _this.process_status(err); });
        this.Spawn.stdout.on("data", function (data) { return _this.process_status(data); });
        this.Spawn.stderr.on("data", function (data) { return _this.process_status(data); });
        this.Status.emit("Changed", { Name: this.Name, Event: "Initialized on port " + port });
        return this;
    };
    ServeProcess.prototype.process_status = function (data) {
        var _this = this;
        var parsedData = data.toString();
        events.forEach(function (x) {
            if (x.Exp.test(parsedData)) {
                if (x.Event === 'Error') {
                    try {
                        var res = x.Exp.exec(parsedData);
                        if (res) {
                            _this.Status.emit('Changed', {
                                Name: _this.Name, Event: x.Event, Data: {
                                    Message: res[0], File: res[2].trim(), Line: Number.parseInt(res[3]), Column: Number.parseInt(res[4]), TsError: res[5].trim(), ErrorMessage: res[6].trim()
                                }
                            });
                        }
                    }
                    catch (_a) { }
                }
                else {
                    _this.Status.emit('Changed', { Name: _this.Name, Event: x.Event });
                }
            }
        });
    };
    return ServeProcess;
}());
exports.ServeProcess = ServeProcess;

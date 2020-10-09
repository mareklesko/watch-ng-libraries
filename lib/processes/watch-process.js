"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var childProcess = __importStar(require("child_process"));
var process_interface_1 = require("./process.interface");
var process_base_1 = require("./process.base");
var WatchProcess = /** @class */ (function (_super) {
    __extends(WatchProcess, _super);
    function WatchProcess(Name, Path) {
        var _this = _super.call(this) || this;
        _this.Name = Name;
        _this.Path = Path;
        _this.Events = [
            { Event: process_interface_1.STATUS_DONE, Exp: new RegExp('Compilation complete. Watching for file changes...') },
            { Event: process_interface_1.STATUS_WORKING, Exp: new RegExp('Building Angular Package') },
            { Event: process_interface_1.STATUS_WORKING, Exp: new RegExp('File change detected. Starting incremental compilation') },
            { Event: process_interface_1.STATUS_ERROR, Exp: new RegExp('(ERROR)\:(.*?)\:(.*)?\:(.*)?\-(.*?)\:(.*)') },
            { Event: process_interface_1.STATUS_ERROR, Exp: new RegExp('ERROR') }
        ];
        _this.Type = 'Watch';
        return _this;
    }
    WatchProcess.prototype.Start = function () {
        this.Spawn = childProcess.spawn('ng', ['build', this.Name, '--watch'], { cwd: this.Path, shell: true });
        this.AttachListeners();
        return this;
    };
    return WatchProcess;
}(process_base_1.ProcessBase));
exports.WatchProcess = WatchProcess;
//# sourceMappingURL=watch-process.js.map
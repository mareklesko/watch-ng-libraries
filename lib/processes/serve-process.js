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
exports.ServeProcess = void 0;
var childProcess = __importStar(require("child_process"));
var process_interface_1 = require("./process.interface");
var process_base_1 = require("./process.base");
var ServeProcess = /** @class */ (function (_super) {
    __extends(ServeProcess, _super);
    function ServeProcess(Name, Path, Detached) {
        var _this = _super.call(this) || this;
        _this.Name = Name;
        _this.Path = Path;
        _this.Detached = Detached;
        _this.Events = [
            { Event: process_interface_1.STATUS_DONE, Exp: new RegExp('Compiled successfully') },
            { Event: process_interface_1.STATUS_WORKING, Exp: new RegExp('0\%') },
            { Event: process_interface_1.STATUS_WORKING, Exp: new RegExp('building') },
            { Event: process_interface_1.STATUS_ERROR, Exp: new RegExp('(ERROR)(.*?)\:(.*)?\:(.*)?\-(.*?)\:(.*)') },
            { Event: process_interface_1.STATUS_WARNING, Exp: new RegExp('(WARNING)\:(.*?)\:(.*)?\:(.*)?\-(.*?)\:(.*)') }
        ];
        _this.Type = 'Serve';
        return _this;
    }
    ServeProcess.prototype.Start = function (port) {
        if (port === void 0) { port = 0; }
        this.Port = port;
        this.Spawn = childProcess.spawn('ng', ['serve', this.Name, "--port " + port], { detached: this.Detached ? this.Detached : false, cwd: this.Path, shell: true, stdio: 'pipe', });
        this.AttachListeners();
        this.Status.next({ Type: process_interface_1.STATUS_WORKING, Message: process_interface_1.STATUS_WORKING });
        return this;
    };
    return ServeProcess;
}(process_base_1.ProcessBase));
exports.ServeProcess = ServeProcess;
//# sourceMappingURL=serve-process.js.map
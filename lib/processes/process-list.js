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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessList = void 0;
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var logger_1 = require("../logger/logger");
var serve_process_1 = require("./serve-process");
var watch_process_1 = require("./watch-process");
var ProcessList = /** @class */ (function (_super) {
    __extends(ProcessList, _super);
    function ProcessList(libraries, projects) {
        var _this = _super.call(this) || this;
        libraries.forEach(function (x) { return _this.push(new watch_process_1.WatchProcess(x)); });
        projects.forEach(function (x) { return _this.push(new serve_process_1.ServeProcess(x)); });
        _this.forEach(function (s) { return rxjs_1.fromEvent(s.Status, 'Changed').subscribe(function (d) { return logger_1.log(d); }); });
        _this.filter(function (x) { return x.Type === 'Watch'; }).forEach(function (x, index, array) {
            var s = rxjs_1.fromEvent(x.Status, 'Changed');
            var sub = s
                .pipe(operators_1.filter(function (y) { return y.Event === 'Compiled'; }))
                .subscribe(function (d) {
                if (array.length - 1 > index) {
                    array[index + 1].start();
                    sub.unsubscribe();
                }
            });
            if (index === 0) {
                x.start();
            }
            if (index === array.length - 1) {
                var sub_1 = s.pipe(operators_1.filter(function (y) { return y.Event === 'Compiled'; })).subscribe(function (d) {
                    _this.filter(function (x) { return x.Type === 'Serve'; }).forEach(function (x, index) { return x.start(4200 + index); });
                    sub_1.unsubscribe();
                });
            }
        });
        return _this;
    }
    return ProcessList;
}(Array));
exports.ProcessList = ProcessList;

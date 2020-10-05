"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = void 0;
exports.log = function (data) {
    switch (data.Event) {
        case 'Error':
            console.error("[" + new Date().toLocaleTimeString() + "] " + data.Name + ": " + data.Event);
            Object.keys(data.Data).forEach(function (x) { return console.error(x + ": " + data.Data[x]); });
            break;
        default:
            console.log("[" + new Date().toLocaleTimeString() + "] " + data.Name + ": " + data.Event);
            break;
    }
};

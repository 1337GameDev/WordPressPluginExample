(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./http"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var http_1 = require("./http");
    var handler = {
        scheme: "https",
        domainHost: http_1.default.domainHost,
        parse: http_1.default.parse,
        serialize: http_1.default.serialize
    };
    exports.default = handler;
});
//# sourceMappingURL=https.js.map
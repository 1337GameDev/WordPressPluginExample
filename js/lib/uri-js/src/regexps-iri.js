(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./regexps-uri"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var regexps_uri_1 = require("./regexps-uri");
    exports.default = regexps_uri_1.buildExps(true);
});
//# sourceMappingURL=regexps-iri.js.map
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./uri", "./schemes/http", "./schemes/https", "./schemes/mailto", "./schemes/urn", "./schemes/urn-uuid", "./uri"], factory);
    }
})(function (require, exports) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    var uri_1 = require("./uri");
    var http_1 = require("./schemes/http");
    uri_1.SCHEMES[http_1.default.scheme] = http_1.default;
    var https_1 = require("./schemes/https");
    uri_1.SCHEMES[https_1.default.scheme] = https_1.default;
    var mailto_1 = require("./schemes/mailto");
    uri_1.SCHEMES[mailto_1.default.scheme] = mailto_1.default;
    var urn_1 = require("./schemes/urn");
    uri_1.SCHEMES[urn_1.default.scheme] = urn_1.default;
    var urn_uuid_1 = require("./schemes/urn-uuid");
    uri_1.SCHEMES[urn_uuid_1.default.scheme] = urn_uuid_1.default;
    __export(require("./uri"));
});
//# sourceMappingURL=index.js.map
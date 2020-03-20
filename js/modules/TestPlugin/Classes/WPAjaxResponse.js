(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./TypeChecker"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TypeChecker_1 = require("./TypeChecker");
    /**
     * A class that represents a response from a plugin AJAX endpoint
     */
    var WPAjaxResponse = /** @class */ (function () {
        function WPAjaxResponse(s, r, m, n) {
            this.success = s;
            this.result = r;
            this.message = m;
            this.newNonce = n;
        }
        WPAjaxResponse.fromRawObj = function (obj) {
            var s, r, m, n = "";
            if (obj.hasOwnProperty('success')) {
                s = obj.success;
                if (!TypeChecker_1.TypeChecker.isBoolean(obj.success)) { // empty/undefined
                    console.warn("\'success\' parameter was not a boolean for \'WPAjaxResponse\'.");
                }
            }
            if (obj.hasOwnProperty('result')) {
                r = obj.result;
            }
            if (obj.hasOwnProperty('message')) {
                m = obj.message;
                if (!(TypeChecker_1.TypeChecker.isString(obj.message) || TypeChecker_1.TypeChecker.isArray(obj.message))) {
                    console.warn("\'message\' parameter was not a string for \'WPAjaxResponse\'.");
                }
            }
            if (obj.hasOwnProperty('newNonce')) {
                n = obj.newNonce;
                if (!TypeChecker_1.TypeChecker.isString(obj.newNonce)) { // empty/undefined
                    console.warn("\'newNonce\' parameter was not a string for \'WPAjaxResponse\'.");
                }
            }
            return new WPAjaxResponse(s, r, m, n);
        };
        return WPAjaxResponse;
    }());
    exports.WPAjaxResponse = WPAjaxResponse;
});
//# sourceMappingURL=WPAjaxResponse.js.map
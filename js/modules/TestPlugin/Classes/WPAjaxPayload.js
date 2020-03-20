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
     * A class that represents the payload that should be sent via ajax to a plugin AJAX endpoint
     */
    var WPAjaxPayload = /** @class */ (function () {
        function WPAjaxPayload(axn, par, n) {
            this.action = axn;
            this.param = par;
            this.nonce = n;
        }
        WPAjaxPayload.fromRawObj = function (obj) {
            var a, p, n = "";
            if (obj.hasOwnProperty('action')) {
                a = obj.action;
                if (!obj.action || !TypeChecker_1.TypeChecker.isString(obj.action)) { // empty/undefined
                    console.warn("\'Action\' parameter was missing for \'WPAjaxPayload\'.");
                }
            }
            if (obj.hasOwnProperty('param')) {
                p = obj.param;
                if (!obj.param || !TypeChecker_1.TypeChecker.isString(obj.param)) { // empty/undefined
                    console.warn("\'Param\' parameter was missing for \'WPAjaxPayload\'.");
                }
            }
            if (obj.hasOwnProperty('nonce')) {
                n = obj.nonce;
            }
            return new WPAjaxPayload(a, p, n);
        };
        WPAjaxPayload.prototype.prepare = function () {
            var that = this;
            return { action: that.action, param: that.param, nonce: that.nonce };
        };
        return WPAjaxPayload;
    }());
    exports.WPAjaxPayload = WPAjaxPayload;
});
//# sourceMappingURL=WPAjaxPayload.js.map
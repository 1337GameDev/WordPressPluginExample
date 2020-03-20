(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * A class to hold functions related to AJAX calls
     */
    var AJAX = /** @class */ (function () {
        function AJAX() {
        }
        AJAX.standardAjaxError = function (jqXHR, textStatus, errorThrown) {
            var details = JSON.stringify(jqXHR, null, 4);
            console.error("Exception: " + errorThrown + " - Status: " + textStatus + " - XMLHTTPRequest:" + details);
        };
        AJAX.standardAjaxSuccess = function (data) {
            console.log("Ajax Success:" + data);
        };
        AJAX.standardAjaxOnProgress = function (evt) {
            console.log("Ajax Progress:" + evt);
        };
        return AJAX;
    }());
    exports.AJAX = AJAX;
});
//# sourceMappingURL=AJAX.js.map
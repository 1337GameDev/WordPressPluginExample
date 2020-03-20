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
     * A class to help with detecting the browser version, upon instantiation
     */
    var BrowserDetect = /** @class */ (function () {
        function BrowserDetect(window) {
            this.browser = "";
            if (TypeChecker_1.TypeChecker.isEmpty(window)) {
                throw 'The window object supplied to BrowserDetect was empty.';
            }
            if (BrowserDetect.dataBrowser.length === 0) {
                BrowserDetect.dataBrowser = [
                    { string: window.navigator.userAgent, subString: "Edge", identity: "MS Edge" },
                    { string: window.navigator.userAgent, subString: "MSIE", identity: "Explorer" },
                    { string: window.navigator.userAgent, subString: "Trident", identity: "Explorer" },
                    { string: window.navigator.userAgent, subString: "Firefox", identity: "Firefox" },
                    { string: window.navigator.userAgent, subString: "Opera", identity: "Opera" },
                    { string: window.navigator.userAgent, subString: "OPR", identity: "Opera" },
                    { string: window.navigator.userAgent, subString: "Chrome", identity: "Chrome" },
                    { string: window.navigator.userAgent, subString: "Safari", identity: "Safari" }
                ];
            }
            this.init();
        }
        BrowserDetect.prototype.getBrowser = function () { return this.browser; };
        BrowserDetect.prototype.getVersion = function () { return this.version; };
        BrowserDetect.prototype.init = function () {
            this.browser = this.searchString(BrowserDetect.dataBrowser) || "Other";
            this.version = this.searchVersion(window.navigator.userAgent) || this.searchVersion(window.navigator.appVersion) || "Unknown";
        };
        BrowserDetect.prototype.searchString = function (data) {
            for (var i = 0; i < data.length; i++) {
                var dataString = data[i].string;
                this.versionSearchString = data[i].subString;
                if (dataString.indexOf(data[i].subString) !== -1) {
                    return data[i].identity;
                }
            }
        };
        BrowserDetect.prototype.searchVersion = function (dataString) {
            var index = dataString.indexOf(this.versionSearchString);
            if (index === -1) {
                return;
            }
            var rv = dataString.indexOf("rv:");
            if (this.versionSearchString === "Trident" && rv !== -1) {
                return parseFloat(dataString.substring(rv + 3));
            }
            else {
                return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
            }
        };
        BrowserDetect.dataBrowser = [];
        return BrowserDetect;
    }());
    exports.BrowserDetect = BrowserDetect;
});
//# sourceMappingURL=BrowserDetect.js.map
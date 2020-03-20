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
     * Represents data received from WordPress via "localize_script"
     *
     */
    var GlobalWPPluginData = /** @class */ (function () {
        function GlobalWPPluginData(site, ajx, plg, uplds, n, name, endpoints) {
            this.siteurl = site;
            this.ajaxurl = ajx;
            this.nonce = n;
            this.pluginURL = plg;
            this.uploadsURL = uplds;
            this.pluginName = name;
            this.ajaxEndpoints = endpoints;
        }
        GlobalWPPluginData.fromRawObj = function (obj) {
            var s, a, n, p, u, na = "";
            var en = [];
            if (obj.hasOwnProperty('siteurl')) {
                s = obj.siteurl;
                if (!obj.siteurl || !TypeChecker_1.TypeChecker.isString(obj.siteurl)) { // empty/undefined
                    console.warn("\'Siteurl\' parameter was missing for \'GlobalWPPluginData\'.");
                }
            }
            if (obj.hasOwnProperty('ajaxurl')) {
                a = obj.ajaxurl;
                if (!obj.ajaxurl || !TypeChecker_1.TypeChecker.isString(obj.ajaxurl)) { // empty/undefined
                    console.warn("\'Ajaxurl\' parameter was missing for \'GlobalWPPluginData\'.");
                }
            }
            if (obj.hasOwnProperty('nonce')) {
                n = obj.nonce;
            }
            if (obj.hasOwnProperty('pluginURL')) {
                p = obj.pluginURL;
                if (!obj.pluginURL || !TypeChecker_1.TypeChecker.isString(obj.pluginURL)) { // empty/undefined
                    console.warn("\'PluginURL\' parameter was missing for \'GlobalWPPluginData\'.");
                }
            }
            if (obj.hasOwnProperty('uploadsURL')) {
                u = obj.uploadsURL;
                if (!obj.uploadsURL || !TypeChecker_1.TypeChecker.isString(obj.uploadsURL)) { // empty/undefined
                    console.warn("\'UploadsURL\' parameter was missing for \'GlobalWPPluginData\'.");
                }
            }
            if (obj.hasOwnProperty('pluginName')) {
                na = obj.pluginName;
                if (!obj.pluginName || !TypeChecker_1.TypeChecker.isString(obj.pluginName)) { // empty/undefined
                    console.warn("\'PluginName\' parameter was missing for \'GlobalWPPluginData\'.");
                }
            }
            if (obj.hasOwnProperty('ajaxEndpoints')) {
                en = obj.ajaxEndpoints;
                if (!obj.ajaxEndpoints || !TypeChecker_1.TypeChecker.isObject(obj.ajaxEndpoints)) { // empty/undefined
                    console.warn("\'AjaxEndpoints\' parameter was missing for \'GlobalWPPluginData\'.");
                }
            }
            return new GlobalWPPluginData(s, a, p, u, n, na, en);
        };
        return GlobalWPPluginData;
    }());
    exports.GlobalWPPluginData = GlobalWPPluginData;
});
//# sourceMappingURL=GlobalWPPluginData.js.map
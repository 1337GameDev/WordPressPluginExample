(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "i18n", "path"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var i18n = require("i18n");
    var path = require("path");
    /** Class representing options that LocalizationHelper accepts. */
    var LocalizationHelperOptions = /** @class */ (function () {
        /**
         * Create an options class.
         */
        function LocalizationHelperOptions() {
        }
        /** The default options */
        LocalizationHelperOptions.getDefaults = function () {
            return LocalizationHelperOptions.defaults;
        };
        LocalizationHelperOptions.defaults = new LocalizationHelperOptions();
        return LocalizationHelperOptions;
    }());
    exports.LocalizationHelperOptions = LocalizationHelperOptions;
    var LocalizationHelper = /** @class */ (function () {
        function LocalizationHelper(options) {
            i18n.configure({
                locales: ['en', 'es'],
                defaultLocale: 'en',
                queryParameter: 'lang',
                directory: path.join('../', 'Localizations')
            });
        }
        /**
         *
         * @returns {string} The current locale code
         */
        LocalizationHelper.prototype.getCurrentLocale = function () {
            return i18n.getLocale();
        };
        /**
         *
         * @returns string[] The list of available locale codes
         */
        LocalizationHelper.prototype.getLocales = function () {
            return i18n.getLocales();
        };
        /**
         *
         * @param locale The locale to set. Must be from the list of available locales.
         */
        LocalizationHelper.prototype.setLocale = function (locale) {
            if (this.getLocales().indexOf(locale) !== -1) {
                i18n.setLocale(locale);
            }
        };
        /**
         *
         * @param string String to translate
         * @param args Extra parameters
         * @returns {string} Translated string
         */
        LocalizationHelper.prototype.translate = function (string, args) {
            if (args === void 0) { args = undefined; }
            return i18n.__(string, args);
        };
        /**
         *
         * @param phrase Object to translate
         * @param count The plural number
         * @returns {string} Translated string
         */
        LocalizationHelper.prototype.translatePlurals = function (phrase, count) {
            return i18n.__n(phrase, count);
        };
        return LocalizationHelper;
    }());
    exports.LocalizationHelper = LocalizationHelper;
});
//# sourceMappingURL=LocalizationHelper.js.map
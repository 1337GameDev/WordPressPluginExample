(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "color-convert", "fs", "path", "../Classes/TypeChecker"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var convert = require("color-convert");
    var fs = require("fs");
    var path = require("path");
    var TypeChecker_1 = require("../Classes/TypeChecker");
    var TestHelper;
    (function (TestHelper) {
        var TestCacheData = /** @class */ (function () {
            function TestCacheData() {
            }
            TestCacheData.ClearCache = function () {
                TestCacheData._cachedData = {};
            };
            TestCacheData.AddToCache = function (key, data, overwriteExistingData) {
                if (overwriteExistingData === void 0) { overwriteExistingData = false; }
                var exists = TestCacheData._cachedData.hasOwnProperty(key);
                if (!overwriteExistingData && exists) {
                    return;
                }
                TestCacheData._cachedData[key] = data;
            };
            TestCacheData.GetFromCache = function (key) {
                var exists = TestCacheData._cachedData.hasOwnProperty(key);
                if (!exists) {
                    return null;
                }
                return TestCacheData._cachedData[key];
            };
            TestCacheData.RemoveFromCache = function (key) {
                var exists = TestCacheData._cachedData.hasOwnProperty(key);
                if (!exists) {
                    return null;
                }
                delete TestCacheData._cachedData[key];
            };
            TestCacheData._cachedData = {};
            return TestCacheData;
        }());
        TestHelper.TestCacheData = TestCacheData;
        var StringHelper = /** @class */ (function () {
            function StringHelper() {
            }
            StringHelper.BeginsWith = function (str, needle) {
                if (TypeChecker_1.TypeChecker.isNull(str) || TypeChecker_1.TypeChecker.isUndefined(str) || TypeChecker_1.TypeChecker.isNull(needle) || TypeChecker_1.TypeChecker.isUndefined(needle) || str.length < needle.length) {
                    return false;
                }
                return (str.lastIndexOf(needle, 0) === 0);
            };
            StringHelper.EndsWith = function (str, needle) {
                if (TypeChecker_1.TypeChecker.isNull(str) || TypeChecker_1.TypeChecker.isUndefined(str) || TypeChecker_1.TypeChecker.isNull(needle) || TypeChecker_1.TypeChecker.isUndefined(needle) || str.length < needle.length) {
                    return false;
                }
                var idxToStartSearch = str.length - needle.length;
                return (str.lastIndexOf(needle, idxToStartSearch) === idxToStartSearch);
            };
            return StringHelper;
        }());
        TestHelper.StringHelper = StringHelper;
        var ColorHelper = /** @class */ (function () {
            function ColorHelper() {
            }
            ColorHelper.ToHexString = function (val) {
                var returnedVal = "";
                if (!TypeChecker_1.TypeChecker.isNull(val) && !TypeChecker_1.TypeChecker.isUndefined(val) && !TestHelper.StringHelper.BeginsWith(val, "#")) {
                    var rgbComponents = TestHelper.ColorHelper.rgbStringToArray(val);
                    returnedVal = convert.rgb.hex(rgbComponents);
                }
                return "#" + returnedVal;
            };
            ;
            ColorHelper.rgbStringToArray = function (rgbStr) {
                var rgbComponents = [];
                if (!TypeChecker_1.TypeChecker.isNull(rgbStr) && !TypeChecker_1.TypeChecker.isUndefined(rgbStr) && TestHelper.StringHelper.BeginsWith(rgbStr.trim(), "rgb")) {
                    var rgbStringComponents = rgbStr.trim().replace(/[^\d,]/g, '').split(',');
                    for (var _i = 0, rgbStringComponents_1 = rgbStringComponents; _i < rgbStringComponents_1.length; _i++) {
                        var comp = rgbStringComponents_1[_i];
                        rgbComponents.push(parseInt(comp));
                    }
                }
                return rgbComponents;
            };
            return ColorHelper;
        }());
        TestHelper.ColorHelper = ColorHelper;
        var HtmlHelper = /** @class */ (function () {
            function HtmlHelper() {
            }
            HtmlHelper.LoadTestHTML = function (filename) {
                if (!TestHelper.StringHelper.EndsWith(filename, ".html")) {
                    filename += ".html";
                }
                return fs.readFileSync(path.join(__dirname, "html", filename), "utf8");
            };
            return HtmlHelper;
        }());
        TestHelper.HtmlHelper = HtmlHelper;
    })(TestHelper = exports.TestHelper || (exports.TestHelper = {}));
});
//# sourceMappingURL=TestHelper.js.map
/// <reference types="jquery" />
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
    var LoaderUIHelper = /** @class */ (function () {
        function LoaderUIHelper() {
        }
        LoaderUIHelper.add3DotLoaderAfter = function ($target, initiallyHidden) {
            if (initiallyHidden === void 0) { initiallyHidden = true; }
            var hiddenClass = initiallyHidden ? "hidden" : "";
            $target.after('<div class="threedotloader ' + hiddenClass + '">\n' +
                '<div class="bounce1"></div>\n' +
                '<div class="bounce2"></div>\n' +
                '<div class="bounce3"></div>\n' +
                '</div>');
        };
        LoaderUIHelper.remove3DotLoaderAfter = function ($target) {
            $target.parent().children('.threedotloader').remove();
        };
        return LoaderUIHelper;
    }());
    exports.LoaderUIHelper = LoaderUIHelper;
});
//# sourceMappingURL=LoaderUIHelper.js.map
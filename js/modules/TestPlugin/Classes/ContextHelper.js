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
     * A class to help with contexts of pages.
     * Used to hold functions and other constants / data that simplify context management
     */
    var ContextHelper = /** @class */ (function () {
        function ContextHelper() {
        }
        return ContextHelper;
    }());
    exports.ContextHelper = ContextHelper;
});
//# sourceMappingURL=ContextHelper.js.map
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
    var testplugin_Context = /** @class */ (function () {
        function testplugin_Context() {
        }
        return testplugin_Context;
    }());
    exports.testplugin_Context = testplugin_Context;
});
//# sourceMappingURL=testplugin_Context.js.map
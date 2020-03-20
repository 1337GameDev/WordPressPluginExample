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
    var testpluginuser_Context = /** @class */ (function () {
        function testpluginuser_Context() {
        }
        return testpluginuser_Context;
    }());
    exports.testpluginuser_Context = testpluginuser_Context;
});
//# sourceMappingURL=testpluginuser_Context.js.map
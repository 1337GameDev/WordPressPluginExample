//require(['css!modules/testModule/css/testModule']);
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
    var Math;
    (function (Math) {
        var Calc = /** @class */ (function () {
            function Calc() {
            }
            Calc.sum = function (a, b) {
                return a + b;
            };
            return Calc;
        }());
        Math.Calc = Calc;
    })(Math = exports.Math || (exports.Math = {}));
});
//# sourceMappingURL=sum.js.map
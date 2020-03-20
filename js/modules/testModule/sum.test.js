(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./sum", "chai", "mocha"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var sum_1 = require("./sum");
    var chai_1 = require("chai");
    require("mocha");
    describe('Sum Test', function () {
        it('Sum of 7 and 2, should be 9', function () {
            chai_1.expect(sum_1.Math.Calc.sum(7, 2)).to.equal(9);
        });
    });
});
//# sourceMappingURL=sum.test.js.map
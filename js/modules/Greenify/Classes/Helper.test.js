/// <reference path="../../../lib/@types/jQuery/index.d.ts" />
/// <reference path="../Test/global.d.ts" />
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "chai", "mocha", "./Helper"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var chai_1 = require("chai");
    require("mocha");
    var Helper_1 = require("./Helper");
    var testClass1 = /** @class */ (function () {
        function testClass1(val) {
            this.f1 = val;
        }
        return testClass1;
    }());
    var testClass2 = /** @class */ (function () {
        function testClass2(val) {
            this.f1 = val;
        }
        return testClass2;
    }());
    describe('Helper Class', function () {
        var body = null;
        var testTarget1 = null;
        var testTarget2 = null;
        it('GetDataIfPresent2', function () {
            body = jQuery('body');
            testTarget1 = jQuery('.testTarget1');
            testTarget2 = jQuery('.testTarget2');
            var data1 = Helper_1.Helper.GetDataIfPresent(testTarget1, 'test');
            var data2 = Helper_1.Helper.GetDataIfPresent(testTarget2, 'test');
            chai_1.expect(data1, "Test data value was incorrect.").to.equal("testdata");
            chai_1.expect(data2, "Test data value was present, despite not being initialized.").to.equal("");
            var tc1 = new testClass1("testValue");
            testTarget2.data("test", tc1);
            var data3 = Helper_1.Helper.GetDataIfPresent(testTarget2, 'test', testClass1);
            var data4 = Helper_1.Helper.GetDataIfPresent(testTarget2, 'test');
            var data5 = Helper_1.Helper.GetDataIfPresent(testTarget2, 'test', testClass2);
            chai_1.expect(data3, "Test data value was not present, or wasn't an instance of the \"testClass1\' test class.").to.equal(tc1);
            chai_1.expect(data4, "Test data returned was not returned.").to.equal(tc1);
            chai_1.expect(data5, "Null wasn't returned, when the improper class was used as a comparison.").to.equal(null);
        });
    });
});
//# sourceMappingURL=Helper.test.js.map
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
    var Helper = /** @class */ (function () {
        function Helper() {
        }
        Helper.GetDataIfPresent = function (element, dataName, dataObjectTypeExpected) {
            var data = null;
            var elementData = element.data();
            if (elementData.hasOwnProperty(dataName)) {
                data = element.data(dataName);
                var compareToType = !TypeChecker_1.TypeChecker.isNull(dataObjectTypeExpected) && !TypeChecker_1.TypeChecker.isUndefined(dataObjectTypeExpected);
                var dataEmpty = TypeChecker_1.TypeChecker.isNull(data) || TypeChecker_1.TypeChecker.isUndefined(data);
                if (!dataEmpty && compareToType) {
                    if (data.constructor !== dataObjectTypeExpected) {
                        data = null;
                    }
                }
            }
            return data;
        };
        return Helper;
    }());
    exports.Helper = Helper;
});
//# sourceMappingURL=Helper.js.map
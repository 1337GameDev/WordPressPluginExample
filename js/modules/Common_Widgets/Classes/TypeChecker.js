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
    var TypeChecker = /** @class */ (function () {
        function TypeChecker() {
        }
        TypeChecker.isString = function (value) {
            return (value !== null) && (typeof value === 'string') || (value instanceof String);
        };
        TypeChecker.isNumber = function (value) {
            return (value !== null) && (typeof value === 'number') && isFinite(value);
        };
        TypeChecker.isArray = function (value) {
            return (value !== null) && (typeof value !== 'undefined') && (typeof value === 'object') && (value instanceof Array);
        };
        TypeChecker.isFunction = function (value) {
            return (value !== null) && (typeof value === 'function');
        };
        TypeChecker.isObject = function (value) {
            return (value !== null) && (typeof value !== 'undefined') && (typeof value === 'object') && (value instanceof Object);
        };
        TypeChecker.isNull = function (value) {
            return (value === null);
        };
        TypeChecker.isBoolean = function (value) {
            return (value !== null) && (typeof value === 'boolean');
        };
        TypeChecker.isRegExp = function (value) {
            return (value !== null) && (typeof value !== 'undefined') && (typeof value === 'object') && (value instanceof RegExp);
        };
        TypeChecker.isError = function (value) {
            return (value !== null) && (value instanceof Error) && (typeof value.message !== 'undefined');
        };
        TypeChecker.isDate = function (value) {
            return (value !== null) && (value instanceof Date);
        };
        TypeChecker.isSymbol = function (value) {
            return (value !== null) && (typeof value === 'symbol');
        };
        TypeChecker.isUndefined = function (value) {
            return (value !== null) && (typeof value === 'undefined');
        };
        TypeChecker.isBooleanOrFunctionTrue = function (value) {
            return (TypeChecker.isBoolean(value) && value) || (TypeChecker.isFunction(value) && value());
        };
        TypeChecker.isEmpty = function (value) {
            return (TypeChecker.isUndefined(value) || TypeChecker.isNull(value) || (value == false) || (value instanceof jQuery && value.length === 0));
        };
        return TypeChecker;
    }());
    exports.TypeChecker = TypeChecker;
});
//# sourceMappingURL=TypeChecker.js.map
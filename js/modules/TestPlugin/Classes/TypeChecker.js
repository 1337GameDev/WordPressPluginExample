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
            return typeof value === 'string' || value instanceof String;
        };
        TypeChecker.isNumber = function (value) {
            return typeof value === 'number' && isFinite(value);
        };
        ;
        TypeChecker.stringIsInteger = function (value) {
            return TypeChecker.isString(value) && (("" + parseInt(value)).length === value.length);
        };
        ;
        TypeChecker.isInteger = function (value) {
            return TypeChecker.isNumber(value) && (value == parseInt(value));
        };
        ;
        TypeChecker.isArray = function (value) {
            return value && typeof value === 'object' && value.constructor === Array;
        };
        ;
        TypeChecker.isFunction = function (value) {
            return typeof value === 'function';
        };
        ;
        TypeChecker.isObject = function (value) {
            return value && typeof value === 'object' && value.constructor === Object;
        };
        ;
        TypeChecker.isNull = function (value) {
            return value === null;
        };
        ;
        TypeChecker.isBoolean = function (value) {
            return typeof value === 'boolean';
        };
        ;
        TypeChecker.isRegExp = function (value) {
            return value && typeof value === 'object' && value.constructor === RegExp;
        };
        ;
        TypeChecker.isError = function (value) {
            return value instanceof Error && typeof value.message !== 'undefined';
        };
        ;
        TypeChecker.isDate = function (value) {
            return value instanceof Date;
        };
        ;
        TypeChecker.isSymbol = function (value) {
            return typeof value === 'symbol';
        };
        TypeChecker.isUndefined = function (value) {
            return (value !== null) && (typeof value === 'undefined');
        };
        TypeChecker.isValidURL = function (value) {
            var isValid = false;
            if ((typeof value !== "undefined") && (value !== null)) {
                var res = value.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
                isValid = (res != null);
            }
            return isValid;
        };
        TypeChecker.isEmpty = function (value) {
            return (TypeChecker.isUndefined(value) || TypeChecker.isNull(value) || (value == false) || (value instanceof jQuery && value.length === 0));
        };
        return TypeChecker;
    }());
    exports.TypeChecker = TypeChecker;
});
//# sourceMappingURL=TypeChecker.js.map
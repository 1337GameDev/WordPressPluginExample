(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "chai", "mocha", "./TypeChecker"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var chai_1 = require("chai");
    require("mocha");
    var TypeChecker_1 = require("./TypeChecker");
    var testTypedClass = /** @class */ (function () {
        function testTypedClass(val) {
            this.v1 = val;
        }
        return testTypedClass;
    }());
    describe('TypeChecker Class', function () {
        it('isString', function () {
            var a;
            var b = null;
            if (false) {
                var c = 1;
            }
            chai_1.expect(TypeChecker_1.TypeChecker.isString(""), "Empty string literal not seen as a string type.").to.be.true;
            chai_1.expect(TypeChecker_1.TypeChecker.isString("Test"), "Test string literal not seen as a string type.").to.be.true;
            chai_1.expect(TypeChecker_1.TypeChecker.isString(null), "Null seen as a string type.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isString(a), "'a' variable (uninitialized) seen as a string type.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isString(b), "'b' variable (set to null) seen as a string type.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isString(c), "'c' variable (undefined) seen as a string type.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isString(5), "Number (int) seen as a string type.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isString([]), "Array seen as a string type.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isString(["Test"]), "Array (with a test string element) seen as a string type.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isString({}), "Empty object seen as a string type.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isString({ "String": "Test" }), "Object (with string field) seen as a string type.").to.be.false;
        });
        it('isUndefined', function () {
            var b;
            if (false) {
                var c = 1;
            }
            chai_1.expect(TypeChecker_1.TypeChecker.isUndefined(b), "'b' (defined but not initialized) not seen as undefined.").to.be.true;
            chai_1.expect(TypeChecker_1.TypeChecker.isUndefined(c), "'c' variable (undefined) not seen as undefined.").to.be.true;
            chai_1.expect(TypeChecker_1.TypeChecker.isUndefined('undefined'), "Undefined string seen as undefined.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isUndefined(null), "Null seen as undefined.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isUndefined(5), "Number (int) seen as undefined.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isUndefined([]), "Array seen as undefined.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isUndefined(["Test"]), "Array (with a test string element) seen as undefined.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isUndefined({}), "Empty object seen as undefined.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isUndefined({ "String": "Test" }), "Object (with string field) seen as undefined.").to.be.false;
        });
        it('isNull', function () {
            var a;
            var b = null;
            if (false) {
                var c = 1;
            }
            chai_1.expect(TypeChecker_1.TypeChecker.isNull(b), "'b' variable (set to null) not seen as null.").to.be.true;
            chai_1.expect(TypeChecker_1.TypeChecker.isNull(null), "Null literal not seen as null.").to.be.true;
            chai_1.expect(TypeChecker_1.TypeChecker.isNull(c), "'c' variable (undefined) seen as null.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isNull(a), "'a' (not initialized) variable not seen as null.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isNull('undefined'), "Undefined string seen as null.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isNull(5), "Number (int) seen as null.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isNull([]), "Array seen as null.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isNull(["null"]), "Array (with a test string element) seen as null.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isNull({}), "Empty object seen as null.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isNull({ "null": "Test" }), "Object (with string field) seen as null.").to.be.false;
        });
        it('isBoolean', function () {
            var a;
            var b = null;
            if (false) {
                var c = 1;
            }
            var d = true;
            chai_1.expect(TypeChecker_1.TypeChecker.isBoolean(d), "'d' variable (boolean) not seen as a boolean.").to.be.true;
            chai_1.expect(TypeChecker_1.TypeChecker.isBoolean(true), "'true' literal not seen as a boolean.").to.be.true;
            chai_1.expect(TypeChecker_1.TypeChecker.isBoolean(false), "'false' literal not seen as a boolean.").to.be.true;
            chai_1.expect(TypeChecker_1.TypeChecker.isBoolean(a), "'a' (not initialized) variable seen as a boolean.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isBoolean(b), "'b' variable (set to null) seen as a boolean.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isBoolean(c), "'c' variable (undefined) seen as a boolean.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isBoolean(null), "Null literal seen as a boolean.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isBoolean('undefined'), "Undefined string seen as a boolean.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isBoolean(5), "Number (int) seen as a boolean.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isBoolean([]), "Array seen as a boolean.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isBoolean(["null"]), "Array (with a test string element) seen as a boolean.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isBoolean({}), "Empty object seen as a boolean.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isBoolean({ "null": "Test" }), "Object (with string field) seen as a boolean.").to.be.false;
        });
        it('isArray', function () {
            var a;
            var b = null;
            if (false) {
                var c = 1;
            }
            chai_1.expect(TypeChecker_1.TypeChecker.isArray([]), "Array literal not seen as an array.").to.be.true;
            chai_1.expect(TypeChecker_1.TypeChecker.isArray(["null"]), "Array (with a test string element) not seen as an array.").to.be.true;
            chai_1.expect(TypeChecker_1.TypeChecker.isArray(a), "'a' (not initialized) variable seen as an array.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isArray(b), "'b' variable (set to null) seen as an array.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isArray(c), "'c' variable (undefined) seen as an array.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isArray(null), "Null literal seen as an array.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isArray('undefined'), "Undefined string seen as an array.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isArray(5), "Number (int) seen as an array.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isArray({}), "Empty object seen as an array.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isArray({ "Array": "Test" }), "Object (with string field) seen as an array.").to.be.false;
        });
        it('isDate', function () {
            var a;
            var b = null;
            if (false) {
                var c = 1;
            }
            chai_1.expect(TypeChecker_1.TypeChecker.isDate(new Date()), "Date object not seen as a Date.").to.be.true;
            chai_1.expect(TypeChecker_1.TypeChecker.isDate(new Date("1995-12-17T03:24:00")), "Date object (with a string date parameter) not seen as a Date.").to.be.true;
            chai_1.expect(TypeChecker_1.TypeChecker.isDate(a), "'a' (not initialized) variable seen as a Date.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isDate(b), "'b' variable (set to null) seen as a Date.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isDate(c), "'c' variable (undefined) seen as a Date.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isDate(null), "Null literal seen as a Date.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isDate('undefined'), "Undefined string seen as a Date.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isDate(5), "Number (int) seen as a Date.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isDate({}), "Empty object seen as a Date.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isDate({ "Date": "Test" }), "Object (with string field) seen as a Date.").to.be.false;
        });
        it('isError', function () {
            var a;
            var b = null;
            if (false) {
                var c = 1;
            }
            chai_1.expect(TypeChecker_1.TypeChecker.isError(new Error()), "Error object not seen as an Error.").to.be.true;
            chai_1.expect(TypeChecker_1.TypeChecker.isError(new Error("Test Error")), "Error object (with a string date parameter) not seen as an Error.").to.be.true;
            chai_1.expect(TypeChecker_1.TypeChecker.isError(a), "'a' (not initialized) variable seen as an Error.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isError(b), "'b' variable (set to null) seen as an Error.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isError(c), "'c' variable (undefined) seen as an Error.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isError(null), "Null literal seen as an Error.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isError('undefined'), "Undefined string seen as an Error.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isError(5), "Number (int) seen as an Error.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isError({}), "Empty object seen as an Error.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isError({ "Error": "Test" }), "Object (with string field) seen as an Error.").to.be.false;
        });
        it('isFunction', function () {
            var a;
            var b = null;
            if (false) {
                var c = 1;
            }
            chai_1.expect(TypeChecker_1.TypeChecker.isFunction(function () { }), "Function not seen as a Function.").to.be.true;
            chai_1.expect(TypeChecker_1.TypeChecker.isFunction(function (v) { console.log(v); }), "Function (with a string value parameter) not seen as a Function.").to.be.true;
            chai_1.expect(TypeChecker_1.TypeChecker.isFunction(a), "'a' (not initialized) variable seen as a Function.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isFunction(b), "'b' variable (set to null) seen as a Function.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isFunction(c), "'c' variable (undefined) seen as a Function.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isFunction(null), "Null literal seen as a Function.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isFunction('undefined'), "Undefined string seen as a Function.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isFunction(5), "Number (int) seen as a Function.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isFunction({}), "Empty object seen as a Function.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isFunction({ "Function": "Test" }), "Object (with string field) seen as an Function.").to.be.false;
        });
        it('isNumber', function () {
            var a;
            var b = null;
            if (false) {
                var c = 1;
            }
            chai_1.expect(TypeChecker_1.TypeChecker.isNumber(5), "Number (int) not seen as a Number.").to.be.true;
            chai_1.expect(TypeChecker_1.TypeChecker.isNumber(5.1), "Number (float) not seen as a Number.").to.be.true;
            chai_1.expect(TypeChecker_1.TypeChecker.isNumber(0x0056), "Number (hex) not seen as a Number.").to.be.true;
            chai_1.expect(TypeChecker_1.TypeChecker.isNumber("5"), "Number (string) seen as a Number.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isNumber(a), "'a' (not initialized) variable seen as a Number.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isNumber(b), "'b' variable (set to null) seen as a Number.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isNumber(c), "'c' variable (undefined) seen as a Number.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isNumber(null), "Null literal seen as a Number.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isNumber('undefined'), "Undefined string seen as a Number.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isNumber({}), "Empty object seen as a Number.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isNumber({ "Number": "Test" }), "Object (with string field) seen as an Number.").to.be.false;
        });
        it('isObject', function () {
            var a;
            var b = null;
            if (false) {
                var c = 1;
            }
            chai_1.expect(TypeChecker_1.TypeChecker.isObject({}), "Empty object not seen as an Object.").to.be.true;
            chai_1.expect(TypeChecker_1.TypeChecker.isObject({ "Object": "Test" }), "Object (with string field) not seen as an Object.").to.be.true;
            chai_1.expect(TypeChecker_1.TypeChecker.isObject(new testTypedClass("Test")), "Object (with string field) not seen as an Object.").to.be.true;
            chai_1.expect(TypeChecker_1.TypeChecker.isObject(5), "Number (int) seen as an Object.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isObject(5.1), "Number (float) seen as an Object.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isObject(0x0056), "Number (hex) seen as an Object.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isObject("5"), "Number (string) seen as an Object.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isObject(a), "'a' (not initialized) variable seen as an Object.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isObject(b), "'b' variable (set to null) seen as an Object.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isObject(c), "'c' variable (undefined) seen as an Object.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isObject(null), "Null literal seen as an Object.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isObject('undefined'), "Undefined string seen as an Object.").to.be.false;
        });
        it('isRegExp', function () {
            var a;
            var b = null;
            if (false) {
                var c = 1;
            }
            chai_1.expect(TypeChecker_1.TypeChecker.isRegExp(new RegExp('')), "RegExp object (with an empty pattern string) not seen as a RegExp.").to.be.true;
            chai_1.expect(TypeChecker_1.TypeChecker.isRegExp(new RegExp('\\w+')), "RegExp object (with pattern string) not seen as a RegExp.").to.be.true;
            chai_1.expect(TypeChecker_1.TypeChecker.isRegExp(5), "Number (int) seen as a RegExp.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isRegExp(5.1), "Number (float) seen as a RegExp.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isRegExp(0x0056), "Number (hex) seen as a RegExp.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isRegExp("5"), "Number (string) seen as a RegExp.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isRegExp(a), "'a' (not initialized) variable seen as a RegExp.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isRegExp(b), "'b' variable (set to null) seen as a RegExp.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isRegExp(c), "'c' variable (undefined) seen as a RegExp.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isRegExp(null), "Null literal seen as a RegExp.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isRegExp('undefined'), "Undefined string seen as a RegExp.").to.be.false;
        });
        it('isSymbol', function () {
            var a;
            var b = null;
            if (false) {
                var c = 1;
            }
            chai_1.expect(TypeChecker_1.TypeChecker.isSymbol(Symbol()), "Symbol object (with no message string) not seen as a Symbol.").to.be.true;
            chai_1.expect(TypeChecker_1.TypeChecker.isSymbol(Symbol('')), "Symbol object (with an empty message string) not seen as a Symbol.").to.be.true;
            chai_1.expect(TypeChecker_1.TypeChecker.isSymbol(Symbol('test')), "Symbol object (with message string) not seen as a Symbol.").to.be.true;
            chai_1.expect(TypeChecker_1.TypeChecker.isSymbol(5), "Number (int) seen as a Symbol.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isSymbol(5.1), "Number (float) seen as a Symbol.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isSymbol(0x0056), "Number (hex) seen as a Symbol.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isSymbol("5"), "Number (string) seen as a Symbol.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isSymbol(a), "'a' (not initialized) variable seen as a Symbol.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isSymbol(b), "'b' variable (set to null) seen as a Symbol.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isSymbol(c), "'c' variable (undefined) seen as a Symbol.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isSymbol(null), "Null literal seen as a Symbol.").to.be.false;
            chai_1.expect(TypeChecker_1.TypeChecker.isSymbol('undefined'), "Undefined string seen as a Symbol.").to.be.false;
        });
    });
});
//# sourceMappingURL=TypeChecker.test.js.map
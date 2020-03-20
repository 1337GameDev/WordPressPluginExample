import { expect } from 'chai';
import 'mocha';
import {TypeChecker} from './TypeChecker';

class testTypedClass {
    public v1:string;
    constructor(val:string){this.v1 = val;}
}

describe('TypeChecker Class', () => {
    it('isString', () => {
        let a;
        let b = null;
        if(false) {
            var c = 1;
        }
        expect(TypeChecker.isString(""),"Empty string literal not seen as a string type.").to.be.true;
        expect(TypeChecker.isString("Test"),"Test string literal not seen as a string type.").to.be.true;

        expect(TypeChecker.isString(null),"Null seen as a string type.").to.be.false;
        expect(TypeChecker.isString(a),"'a' variable (uninitialized) seen as a string type.").to.be.false;
        expect(TypeChecker.isString(b),"'b' variable (set to null) seen as a string type.").to.be.false;
        expect(TypeChecker.isString(c),"'c' variable (undefined) seen as a string type.").to.be.false;
        expect(TypeChecker.isString(5),"Number (int) seen as a string type.").to.be.false;
        expect(TypeChecker.isString([]),"Array seen as a string type.").to.be.false;
        expect(TypeChecker.isString(["Test"]),"Array (with a test string element) seen as a string type.").to.be.false;
        expect(TypeChecker.isString({}),"Empty object seen as a string type.").to.be.false;
        expect(TypeChecker.isString({"String":"Test"}),"Object (with string field) seen as a string type.").to.be.false;

    });

    it('isUndefined', () => {
        let b;
        if(false) {
            var c = 1;
        }
        expect(TypeChecker.isUndefined(b),"'b' (defined but not initialized) not seen as undefined.").to.be.true;
        expect(TypeChecker.isUndefined(c),"'c' variable (undefined) not seen as undefined.").to.be.true;

        expect(TypeChecker.isUndefined('undefined'),"Undefined string seen as undefined.").to.be.false;
        expect(TypeChecker.isUndefined(null),"Null seen as undefined.").to.be.false;
        expect(TypeChecker.isUndefined(5),"Number (int) seen as undefined.").to.be.false;
        expect(TypeChecker.isUndefined([]),"Array seen as undefined.").to.be.false;
        expect(TypeChecker.isUndefined(["Test"]),"Array (with a test string element) seen as undefined.").to.be.false;
        expect(TypeChecker.isUndefined({}),"Empty object seen as undefined.").to.be.false;
        expect(TypeChecker.isUndefined({"String":"Test"}),"Object (with string field) seen as undefined.").to.be.false;

    });

    it('isNull', () => {
        let a;
        let b = null;
        if(false) {
            var c = 1;
        }

        expect(TypeChecker.isNull(b),"'b' variable (set to null) not seen as null.").to.be.true;
        expect(TypeChecker.isNull(null),"Null literal not seen as null.").to.be.true;

        expect(TypeChecker.isNull(c),"'c' variable (undefined) seen as null.").to.be.false;
        expect(TypeChecker.isNull(a),"'a' (not initialized) variable not seen as null.").to.be.false;
        expect(TypeChecker.isNull('undefined'),"Undefined string seen as null.").to.be.false;
        expect(TypeChecker.isNull(5),"Number (int) seen as null.").to.be.false;
        expect(TypeChecker.isNull([]),"Array seen as null.").to.be.false;
        expect(TypeChecker.isNull(["null"]),"Array (with a test string element) seen as null.").to.be.false;
        expect(TypeChecker.isNull({}),"Empty object seen as null.").to.be.false;
        expect(TypeChecker.isNull({"null":"Test"}),"Object (with string field) seen as null.").to.be.false;

    });

    it('isBoolean', () => {
        let a;
        let b = null;
        if(false) {
            var c = 1;
        }
        let d = true;

        expect(TypeChecker.isBoolean(d),"'d' variable (boolean) not seen as a boolean.").to.be.true;
        expect(TypeChecker.isBoolean(true),"'true' literal not seen as a boolean.").to.be.true;
        expect(TypeChecker.isBoolean(false),"'false' literal not seen as a boolean.").to.be.true;

        expect(TypeChecker.isBoolean(a),"'a' (not initialized) variable seen as a boolean.").to.be.false;
        expect(TypeChecker.isBoolean(b),"'b' variable (set to null) seen as a boolean.").to.be.false;
        expect(TypeChecker.isBoolean(c),"'c' variable (undefined) seen as a boolean.").to.be.false;
        expect(TypeChecker.isBoolean(null),"Null literal seen as a boolean.").to.be.false;
        expect(TypeChecker.isBoolean('undefined'),"Undefined string seen as a boolean.").to.be.false;
        expect(TypeChecker.isBoolean(5),"Number (int) seen as a boolean.").to.be.false;
        expect(TypeChecker.isBoolean([]),"Array seen as a boolean.").to.be.false;
        expect(TypeChecker.isBoolean(["null"]),"Array (with a test string element) seen as a boolean.").to.be.false;
        expect(TypeChecker.isBoolean({}),"Empty object seen as a boolean.").to.be.false;
        expect(TypeChecker.isBoolean({"null":"Test"}),"Object (with string field) seen as a boolean.").to.be.false;

    });

    it('isArray', () => {
        let a;
        let b = null;
        if(false) {
            var c = 1;
        }
        expect(TypeChecker.isArray([]),"Array literal not seen as an array.").to.be.true;
        expect(TypeChecker.isArray(["null"]),"Array (with a test string element) not seen as an array.").to.be.true;

        expect(TypeChecker.isArray(a),"'a' (not initialized) variable seen as an array.").to.be.false;
        expect(TypeChecker.isArray(b),"'b' variable (set to null) seen as an array.").to.be.false;
        expect(TypeChecker.isArray(c),"'c' variable (undefined) seen as an array.").to.be.false;
        expect(TypeChecker.isArray(null),"Null literal seen as an array.").to.be.false;
        expect(TypeChecker.isArray('undefined'),"Undefined string seen as an array.").to.be.false;
        expect(TypeChecker.isArray(5),"Number (int) seen as an array.").to.be.false;
        expect(TypeChecker.isArray({}),"Empty object seen as an array.").to.be.false;
        expect(TypeChecker.isArray({"Array":"Test"}),"Object (with string field) seen as an array.").to.be.false;

    });

    it('isDate', () => {
        let a;
        let b = null;
        if(false) {
            var c = 1;
        }
        expect(TypeChecker.isDate(new Date()),"Date object not seen as a Date.").to.be.true;
        expect(TypeChecker.isDate(new Date("1995-12-17T03:24:00")),"Date object (with a string date parameter) not seen as a Date.").to.be.true;

        expect(TypeChecker.isDate(a),"'a' (not initialized) variable seen as a Date.").to.be.false;
        expect(TypeChecker.isDate(b),"'b' variable (set to null) seen as a Date.").to.be.false;
        expect(TypeChecker.isDate(c),"'c' variable (undefined) seen as a Date.").to.be.false;
        expect(TypeChecker.isDate(null),"Null literal seen as a Date.").to.be.false;
        expect(TypeChecker.isDate('undefined'),"Undefined string seen as a Date.").to.be.false;
        expect(TypeChecker.isDate(5),"Number (int) seen as a Date.").to.be.false;
        expect(TypeChecker.isDate({}),"Empty object seen as a Date.").to.be.false;
        expect(TypeChecker.isDate({"Date":"Test"}),"Object (with string field) seen as a Date.").to.be.false;

    });

    it('isError', () => {
        let a;
        let b = null;
        if(false) {
            var c = 1;
        }
        expect(TypeChecker.isError(new Error()),"Error object not seen as an Error.").to.be.true;
        expect(TypeChecker.isError(new Error("Test Error")),"Error object (with a string date parameter) not seen as an Error.").to.be.true;

        expect(TypeChecker.isError(a),"'a' (not initialized) variable seen as an Error.").to.be.false;
        expect(TypeChecker.isError(b),"'b' variable (set to null) seen as an Error.").to.be.false;
        expect(TypeChecker.isError(c),"'c' variable (undefined) seen as an Error.").to.be.false;
        expect(TypeChecker.isError(null),"Null literal seen as an Error.").to.be.false;
        expect(TypeChecker.isError('undefined'),"Undefined string seen as an Error.").to.be.false;
        expect(TypeChecker.isError(5),"Number (int) seen as an Error.").to.be.false;
        expect(TypeChecker.isError({}),"Empty object seen as an Error.").to.be.false;
        expect(TypeChecker.isError({"Error":"Test"}),"Object (with string field) seen as an Error.").to.be.false;

    });

    it('isFunction', () => {
        let a;
        let b = null;
        if(false) {
            var c = 1;
        }
        expect(TypeChecker.isFunction(function(){}),"Function not seen as a Function.").to.be.true;
        expect(TypeChecker.isFunction(function(v:string){console.log(v);}),"Function (with a string value parameter) not seen as a Function.").to.be.true;

        expect(TypeChecker.isFunction(a),"'a' (not initialized) variable seen as a Function.").to.be.false;
        expect(TypeChecker.isFunction(b),"'b' variable (set to null) seen as a Function.").to.be.false;
        expect(TypeChecker.isFunction(c),"'c' variable (undefined) seen as a Function.").to.be.false;
        expect(TypeChecker.isFunction(null),"Null literal seen as a Function.").to.be.false;
        expect(TypeChecker.isFunction('undefined'),"Undefined string seen as a Function.").to.be.false;
        expect(TypeChecker.isFunction(5),"Number (int) seen as a Function.").to.be.false;
        expect(TypeChecker.isFunction({}),"Empty object seen as a Function.").to.be.false;
        expect(TypeChecker.isFunction({"Function":"Test"}),"Object (with string field) seen as an Function.").to.be.false;

    });

    it('isNumber', () => {
        let a;
        let b = null;
        if(false) {
            var c = 1;
        }
        expect(TypeChecker.isNumber(5),"Number (int) not seen as a Number.").to.be.true;
        expect(TypeChecker.isNumber(5.1),"Number (float) not seen as a Number.").to.be.true;
        expect(TypeChecker.isNumber(0x0056),"Number (hex) not seen as a Number.").to.be.true;

        expect(TypeChecker.isNumber("5"),"Number (string) seen as a Number.").to.be.false;
        expect(TypeChecker.isNumber(a),"'a' (not initialized) variable seen as a Number.").to.be.false;
        expect(TypeChecker.isNumber(b),"'b' variable (set to null) seen as a Number.").to.be.false;
        expect(TypeChecker.isNumber(c),"'c' variable (undefined) seen as a Number.").to.be.false;
        expect(TypeChecker.isNumber(null),"Null literal seen as a Number.").to.be.false;
        expect(TypeChecker.isNumber('undefined'),"Undefined string seen as a Number.").to.be.false;
        expect(TypeChecker.isNumber({}),"Empty object seen as a Number.").to.be.false;
        expect(TypeChecker.isNumber({"Number":"Test"}),"Object (with string field) seen as an Number.").to.be.false;

    });

    it('isObject', () => {
        let a;
        let b = null;
        if(false) {
            var c = 1;
        }
        expect(TypeChecker.isObject({}),"Empty object not seen as an Object.").to.be.true;
        expect(TypeChecker.isObject({"Object":"Test"}),"Object (with string field) not seen as an Object.").to.be.true;
        expect(TypeChecker.isObject(new testTypedClass("Test")),"Object (with string field) not seen as an Object.").to.be.true;

        expect(TypeChecker.isObject(5),"Number (int) seen as an Object.").to.be.false;
        expect(TypeChecker.isObject(5.1),"Number (float) seen as an Object.").to.be.false;
        expect(TypeChecker.isObject(0x0056),"Number (hex) seen as an Object.").to.be.false;
        expect(TypeChecker.isObject("5"),"Number (string) seen as an Object.").to.be.false;
        expect(TypeChecker.isObject(a),"'a' (not initialized) variable seen as an Object.").to.be.false;
        expect(TypeChecker.isObject(b),"'b' variable (set to null) seen as an Object.").to.be.false;
        expect(TypeChecker.isObject(c),"'c' variable (undefined) seen as an Object.").to.be.false;
        expect(TypeChecker.isObject(null),"Null literal seen as an Object.").to.be.false;
        expect(TypeChecker.isObject('undefined'),"Undefined string seen as an Object.").to.be.false;

    });

    it('isRegExp', () => {
        let a;
        let b = null;
        if(false) {
            var c = 1;
        }
        expect(TypeChecker.isRegExp(new RegExp('')),"RegExp object (with an empty pattern string) not seen as a RegExp.").to.be.true;
        expect(TypeChecker.isRegExp(new RegExp('\\w+')),"RegExp object (with pattern string) not seen as a RegExp.").to.be.true;

        expect(TypeChecker.isRegExp(5),"Number (int) seen as a RegExp.").to.be.false;
        expect(TypeChecker.isRegExp(5.1),"Number (float) seen as a RegExp.").to.be.false;
        expect(TypeChecker.isRegExp(0x0056),"Number (hex) seen as a RegExp.").to.be.false;
        expect(TypeChecker.isRegExp("5"),"Number (string) seen as a RegExp.").to.be.false;
        expect(TypeChecker.isRegExp(a),"'a' (not initialized) variable seen as a RegExp.").to.be.false;
        expect(TypeChecker.isRegExp(b),"'b' variable (set to null) seen as a RegExp.").to.be.false;
        expect(TypeChecker.isRegExp(c),"'c' variable (undefined) seen as a RegExp.").to.be.false;
        expect(TypeChecker.isRegExp(null),"Null literal seen as a RegExp.").to.be.false;
        expect(TypeChecker.isRegExp('undefined'),"Undefined string seen as a RegExp.").to.be.false;

    });

    it('isSymbol', () => {
        let a;
        let b = null;
        if(false) {
            var c = 1;
        }
        expect(TypeChecker.isSymbol(Symbol()),"Symbol object (with no message string) not seen as a Symbol.").to.be.true;
        expect(TypeChecker.isSymbol(Symbol('')),"Symbol object (with an empty message string) not seen as a Symbol.").to.be.true;
        expect(TypeChecker.isSymbol(Symbol('test')),"Symbol object (with message string) not seen as a Symbol.").to.be.true;

        expect(TypeChecker.isSymbol(5),"Number (int) seen as a Symbol.").to.be.false;
        expect(TypeChecker.isSymbol(5.1),"Number (float) seen as a Symbol.").to.be.false;
        expect(TypeChecker.isSymbol(0x0056),"Number (hex) seen as a Symbol.").to.be.false;
        expect(TypeChecker.isSymbol("5"),"Number (string) seen as a Symbol.").to.be.false;
        expect(TypeChecker.isSymbol(a),"'a' (not initialized) variable seen as a Symbol.").to.be.false;
        expect(TypeChecker.isSymbol(b),"'b' variable (set to null) seen as a Symbol.").to.be.false;
        expect(TypeChecker.isSymbol(c),"'c' variable (undefined) seen as a Symbol.").to.be.false;
        expect(TypeChecker.isSymbol(null),"Null literal seen as a Symbol.").to.be.false;
        expect(TypeChecker.isSymbol('undefined'),"Undefined string seen as a Symbol.").to.be.false;

    });
});
/// <reference path="../../lib/@types/jsdom/index.d.ts" />
/// <reference path="../../lib/@types/jQuery/index.d.ts" />
/// <reference path="./Test/global.d.ts" />
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "chai", "mocha", "./Test/TestHelper", "./Greenify"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var chai_1 = require("chai");
    require("mocha");
    var TestHelper_1 = require("./Test/TestHelper");
    var Greenify_1 = require("./Greenify");
    describe('Options Class', function () {
        it('Constructor', function () {
            var o = new Greenify_1.Visuals.GreenifyOptions('#FFFFFF', '#000000');
            var o2 = new Greenify_1.Visuals.GreenifyOptions('#000000', '#FFFFFF');
            var o3 = new Greenify_1.Visuals.GreenifyOptions('#FFFFFF', '#000000', true, false);
            var o4 = new Greenify_1.Visuals.GreenifyOptions('#FFFFFF', '#000000', false);
            chai_1.expect(o.backgroundColor, "Background color field value was incorrect.").to.equal("#000000");
            chai_1.expect(o.color, "Color field value was incorrect.").to.equal("#FFFFFF");
            chai_1.expect(o.returnJQuery, "Return jQuery field value was incorrect.").to.equal(false);
            chai_1.expect(o.loadCSS, "Load CSS field value was incorrect.").to.equal(true);
            chai_1.expect(o2.backgroundColor, "Background color field value was incorrect.").to.equal("#FFFFFF");
            chai_1.expect(o2.color, "Color field value was incorrect.").to.equal("#000000");
            chai_1.expect(o2.returnJQuery, "Return jQuery field value was incorrect.").to.equal(false);
            chai_1.expect(o2.loadCSS, "Load CSS field value was incorrect.").to.equal(true);
            chai_1.expect(o3.backgroundColor, "Background color field value was incorrect.").to.equal("#000000");
            chai_1.expect(o3.color, "Color field value was incorrect.").to.equal("#FFFFFF");
            chai_1.expect(o3.returnJQuery, "Return jQuery field value was incorrect.").to.equal(true);
            chai_1.expect(o3.loadCSS, "Load CSS field value was incorrect.").to.equal(false);
            chai_1.expect(o4.backgroundColor, "Background color field value was incorrect.").to.equal("#000000");
            chai_1.expect(o4.color, "Color field value was incorrect.").to.equal("#FFFFFF");
            chai_1.expect(o4.returnJQuery, "Return jQuery field value was incorrect.").to.equal(false);
            chai_1.expect(o4.loadCSS, "Load CSS field value was incorrect.").to.equal(true);
        });
        it('Defaults', function () {
            var o = Greenify_1.Visuals.GreenifyOptions.getDefaults();
            chai_1.expect(o.backgroundColor, "Background color field value was incorrect.").to.equal("#000000");
            chai_1.expect(o.color, "Color field value was incorrect.").to.equal("#00FF00");
            chai_1.expect(o.returnJQuery, "Return jQuery field value was incorrect.").to.equal(false);
            chai_1.expect(o.loadCSS, "Load CSS field value was incorrect.").to.equal(true);
        });
    });
    describe('Attached to JQuery', function () {
        var body = null;
        it('Preconditions', function () {
            chai_1.expect(jQuery.fn.hasOwnProperty("Greenify"), "jQuery already has Greenify instance.").to.be.false;
            body = jQuery('body');
            chai_1.expect(body.length, "Body was not found!").to.equal(1);
        });
        it('Attach', function () {
            chai_1.expect(jQuery.fn.hasOwnProperty("Greenify"), "jQuery DOES have a Greenify instance before testing attaching.").to.be.false;
            Greenify_1.Visuals.Greenify.AttachToJQuery(jQuery);
            chai_1.expect(jQuery.fn.hasOwnProperty("Greenify"), "jQuery does NOT have a Greenify instance after testing attaching.").to.be.true;
        });
        it('Detach', function () {
            chai_1.expect(jQuery.fn.hasOwnProperty("Greenify"), "jQuery does NOT have a Greenify instance before detaching.").to.be.true;
            Greenify_1.Visuals.Greenify.RemoveFromJQuery(jQuery);
            chai_1.expect(jQuery.fn.hasOwnProperty("Greenify"), "jQuery DOES have a Greenify instance after detaching.").to.be.false;
        });
    });
    describe('Instantiate', function () {
        var body = null;
        var target1 = null;
        it('Preconditions', function () {
            chai_1.expect(jQuery.fn.hasOwnProperty("Greenify"), "jQuery already has Greenify instance.").to.be.false;
            Greenify_1.Visuals.Greenify.AttachToJQuery(jQuery);
        });
        it('Instantiate', function () {
            body = jQuery("body");
            target1 = body.find(".testTarget1");
            target1.Greenify(); //default options
            chai_1.expect(Greenify_1.Visuals.Greenify.ElementHasInstance(target1), "The target1 element does NOT have a Greenify instance.").to.be.true;
        });
        it('Destroy', function () {
            target1.Greenify("Destroy");
            chai_1.expect(Greenify_1.Visuals.Greenify.ElementHasInstance(target1), "The target1 element does have a Greenify instance after being destroyed.").to.be.false;
            Greenify_1.Visuals.Greenify.RemoveFromJQuery(jQuery);
        });
    });
    describe('Default CSS Colors', function () {
        var body = null;
        var target1 = null;
        it('Preconditions', function () {
            Greenify_1.Visuals.Greenify.AttachToJQuery(jQuery);
        });
        it('Instantiate', function () {
            body = jQuery("body");
            target1 = body.find(".testTarget1");
            target1.Greenify(); //default options
            var colorVal = target1.css("color");
            var backgroundColorVal = target1.css("background-color");
            //force both to HEX
            colorVal = TestHelper_1.TestHelper.ColorHelper.ToHexString(colorVal);
            backgroundColorVal = TestHelper_1.TestHelper.ColorHelper.ToHexString(backgroundColorVal);
            chai_1.expect(colorVal, "The target1 element has an incorrect \'color\' CSS property.").to.equal("#00FF00");
            chai_1.expect(backgroundColorVal, "The target1 element has an incorrect \'background-color\' CSS property.").to.equal("#000000");
        });
        it('Destroy', function () {
            target1.Greenify("Destroy");
            Greenify_1.Visuals.Greenify.RemoveFromJQuery(jQuery);
        });
    });
});
//# sourceMappingURL=Greenify.test.js.map
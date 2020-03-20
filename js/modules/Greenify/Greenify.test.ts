/// <reference path="../../lib/@types/jsdom/index.d.ts" />
/// <reference path="../../lib/@types/jQuery/index.d.ts" />
/// <reference path="./Test/global.d.ts" />

import { expect } from 'chai';
import 'mocha';
import {TestHelper} from './Test/TestHelper';
import {Visuals} from './Greenify';

describe('Options Class', () => {
    it('Constructor', () => {
        let o = new Visuals.GreenifyOptions('#FFFFFF', '#000000');
        let o2 = new Visuals.GreenifyOptions('#000000', '#FFFFFF');
        let o3 = new Visuals.GreenifyOptions('#FFFFFF', '#000000', true, false);
        let o4 = new Visuals.GreenifyOptions('#FFFFFF', '#000000', false);

        expect(o.backgroundColor,"Background color field value was incorrect.").to.equal("#000000");
        expect(o.color, "Color field value was incorrect.").to.equal("#FFFFFF");
        expect(o.returnJQuery, "Return jQuery field value was incorrect.").to.equal(false);
        expect(o.loadCSS, "Load CSS field value was incorrect.").to.equal(true);

        expect(o2.backgroundColor,"Background color field value was incorrect.").to.equal("#FFFFFF");
        expect(o2.color, "Color field value was incorrect.").to.equal("#000000");
        expect(o2.returnJQuery, "Return jQuery field value was incorrect.").to.equal(false);
        expect(o2.loadCSS, "Load CSS field value was incorrect.").to.equal(true);

        expect(o3.backgroundColor,"Background color field value was incorrect.").to.equal("#000000");
        expect(o3.color, "Color field value was incorrect.").to.equal("#FFFFFF");
        expect(o3.returnJQuery, "Return jQuery field value was incorrect.").to.equal(true);
        expect(o3.loadCSS, "Load CSS field value was incorrect.").to.equal(false);

        expect(o4.backgroundColor,"Background color field value was incorrect.").to.equal("#000000");
        expect(o4.color, "Color field value was incorrect.").to.equal("#FFFFFF");
        expect(o4.returnJQuery, "Return jQuery field value was incorrect.").to.equal(false);
        expect(o4.loadCSS, "Load CSS field value was incorrect.").to.equal(true);
    });

    it('Defaults', () => {
        let o = Visuals.GreenifyOptions.getDefaults();

        expect(o.backgroundColor,"Background color field value was incorrect.").to.equal("#000000");
        expect(o.color, "Color field value was incorrect.").to.equal("#00FF00");
        expect(o.returnJQuery, "Return jQuery field value was incorrect.").to.equal(false);
        expect(o.loadCSS, "Load CSS field value was incorrect.").to.equal(true);
    });

});

describe('Attached to JQuery', () => {
    let body = null;
    it('Preconditions', function () {
        expect(jQuery.fn.hasOwnProperty("Greenify"), "jQuery already has Greenify instance.").to.be.false;

        body = jQuery('body');
        expect(body.length, "Body was not found!").to.equal(1);
    });

    it('Attach', function () {
        expect(jQuery.fn.hasOwnProperty("Greenify"), "jQuery DOES have a Greenify instance before testing attaching.").to.be.false;
        Visuals.Greenify.AttachToJQuery(jQuery);
        expect(jQuery.fn.hasOwnProperty("Greenify"), "jQuery does NOT have a Greenify instance after testing attaching.").to.be.true;
    });

    it('Detach', function () {
        expect(jQuery.fn.hasOwnProperty("Greenify"), "jQuery does NOT have a Greenify instance before detaching.").to.be.true;
        Visuals.Greenify.RemoveFromJQuery(jQuery);
        expect(jQuery.fn.hasOwnProperty("Greenify"), "jQuery DOES have a Greenify instance after detaching.").to.be.false;
    });
});

describe('Instantiate', () => {
    let body = null;
    let target1 = null;

    it('Preconditions', function () {
        expect(jQuery.fn.hasOwnProperty("Greenify"), "jQuery already has Greenify instance.").to.be.false;
        Visuals.Greenify.AttachToJQuery(jQuery);
    });

    it('Instantiate', function () {
        body = jQuery("body");
        target1 = body.find(".testTarget1");

        target1.Greenify();//default options
        expect(Visuals.Greenify.ElementHasInstance(target1), "The target1 element does NOT have a Greenify instance.").to.be.true;

    });

    it('Destroy', function () {
        target1.Greenify("Destroy");
        expect(Visuals.Greenify.ElementHasInstance(target1), "The target1 element does have a Greenify instance after being destroyed.").to.be.false;

        Visuals.Greenify.RemoveFromJQuery(jQuery);
    });
});

describe('Default CSS Colors', () => {
    let body = null;
    let target1 = null;

    it('Preconditions', function () {
        Visuals.Greenify.AttachToJQuery(jQuery);
    });

    it('Instantiate', function () {
        body = jQuery("body");
        target1 = body.find(".testTarget1");

        target1.Greenify();//default options
        let colorVal = target1.css("color");
        let backgroundColorVal = target1.css("background-color");

        //force both to HEX
        colorVal = TestHelper.ColorHelper.ToHexString(colorVal);
        backgroundColorVal = TestHelper.ColorHelper.ToHexString(backgroundColorVal);

        expect(colorVal, "The target1 element has an incorrect \'color\' CSS property.").to.equal("#00FF00");
        expect(backgroundColorVal, "The target1 element has an incorrect \'background-color\' CSS property.").to.equal("#000000");
    });

    it('Destroy', function () {
        target1.Greenify("Destroy");
        Visuals.Greenify.RemoveFromJQuery(jQuery);
    });
});

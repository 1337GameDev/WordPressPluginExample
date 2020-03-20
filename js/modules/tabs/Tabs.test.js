/// <reference path="../../lib/@types/jsdom/index.d.ts" />
/// <reference path="../../lib/@types/jQuery/index.d.ts" />
/// <reference path="./Test/global.d.ts" />
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "chai", "mocha", "./Tabs"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var chai_1 = require("chai");
    require("mocha");
    var Tabs_1 = require("./Tabs");
    describe('Options Class', function () {
        it('Constructor', function () {
            var o1 = new Tabs_1.Navigation.TabOptions(true, false);
            var o2 = new Tabs_1.Navigation.TabOptions(false);
            var o3 = new Tabs_1.Navigation.TabOptions();
            chai_1.expect(o1.returnJQuery, "Return jQuery field value was incorrect.").to.equal(true);
            chai_1.expect(o1.loadCSS, "Load CSS field value was incorrect.").to.equal(false);
            chai_1.expect(o2.returnJQuery, "Return jQuery field value was incorrect.").to.equal(false);
            chai_1.expect(o2.loadCSS, "Load CSS field value was incorrect.").to.equal(true);
            chai_1.expect(o3.returnJQuery, "Return jQuery field value was incorrect.").to.equal(false);
            chai_1.expect(o3.loadCSS, "Load CSS field value was incorrect.").to.equal(true);
        });
        it('Defaults', function () {
            var o = Tabs_1.Navigation.TabOptions.getDefaults();
            chai_1.expect(o.returnJQuery, "Return jQuery field value was incorrect.").to.equal(false);
            chai_1.expect(o.loadCSS, "Load CSS field value was incorrect.").to.equal(true);
        });
    });
    describe('Attached to JQuery', function () {
        var body = null;
        it('Preconditions', function () {
            chai_1.expect(jQuery.fn.hasOwnProperty("Tabs"), "jQuery already has Tabs instance.").to.be.false;
            body = jQuery('body');
            chai_1.expect(body.length, "Body was not found!").to.equal(1);
        });
        it('Attach', function () {
            chai_1.expect(jQuery.fn.hasOwnProperty("Tabs"), "jQuery DOES have a Tabs instance before testing attaching.").to.be.false;
            Tabs_1.Navigation.Tabs.AttachToJQuery(jQuery);
            chai_1.expect(jQuery.fn.hasOwnProperty("Tabs"), "jQuery does NOT have a Tabs instance after testing attaching.").to.be.true;
        });
        it('Detach', function () {
            chai_1.expect(jQuery.fn.hasOwnProperty("Tabs"), "jQuery does NOT have a Tabs instance before detaching.").to.be.true;
            Tabs_1.Navigation.Tabs.RemoveFromJQuery(jQuery);
            chai_1.expect(jQuery.fn.hasOwnProperty("Tabs"), "jQuery DOES have a Tabs instance after detaching.").to.be.false;
        });
    });
    describe('Instantiate', function () {
        var body = null;
        var navtabs = null;
        it('Preconditions', function () {
            chai_1.expect(jQuery.fn.hasOwnProperty("Tabs"), "jQuery already has Tabs instance.").to.be.false;
            Tabs_1.Navigation.Tabs.AttachToJQuery(jQuery);
        });
        it('Instantiate', function () {
            body = jQuery("body");
            navtabs = body.find("#testTabs");
            navtabs.Tabs(); //default options
            chai_1.expect(Tabs_1.Navigation.Tabs.ElementHasInstance(navtabs), "The target1 element does NOT have a Tabs instance.").to.be.true;
        });
        it('Destroy', function () {
            navtabs.Tabs("Destroy");
            chai_1.expect(Tabs_1.Navigation.Tabs.ElementHasInstance(navtabs), "The target1 element does have a Tabs instance after being destroyed.").to.be.false;
            Tabs_1.Navigation.Tabs.RemoveFromJQuery(jQuery);
        });
    });
    describe('Default Selected Tab', function () {
        var body = null;
        var navtabs = null;
        it('Preconditions', function () {
            Tabs_1.Navigation.Tabs.AttachToJQuery(jQuery);
        });
        it('Instantiate', function () {
            body = jQuery("body");
            navtabs = body.find("#testTabs");
            navtabs.Tabs(); //default options
            var defaultTab = navtabs.find("a.nav-tab:first-child");
            var defaultTabContent = navtabs.find(".navtab-content:first-child");
            chai_1.expect(defaultTab.hasClass("selcted"), "The default tab was not selected.").to.be.true;
            chai_1.expect(defaultTabContent.hasClass("selcted"), "The default tab content was not selected.").to.be.true;
            chai_1.expect(defaultTabContent.is(":visible"), "The default tab content was not visible.").to.be.true;
        });
        it('Get Current Tab', function () {
            var currentTab = navtabs.Tabs("CurrentTab");
            chai_1.expect(currentTab, "The default tab ('tab1') was not selected.").to.equal("tab1");
        });
        it('Select Tab / Get Tab', function () {
            navtabs.Tabs("SelectTab", "tab2");
            var currentTab = navtabs.Tabs("CurrentTab");
            var getTabElement = navtabs.Tabs("GetTab");
            var getTabContentElement = navtabs.Tabs("GetTabContentContainer");
            var selectedTab = navtabs.find("a.nav-tab:first-child");
            var selectedTabContent = navtabs.find(".navtab-content:first-child");
            chai_1.expect(currentTab, "The selected tab was not 'tab2.'").to.equal("tab2");
            chai_1.expect(getTabElement.data("tabname"), "The tab fetched was not 'tab2.'").to.equal("tab2");
            chai_1.expect(selectedTabContent.data("tabname"), "The tab content fetched was not 'tab2.'").to.equal("tab2");
            chai_1.expect(selectedTab.hasClass("selcted"), "The selected tab (tab2) was not selected.").to.be.true;
            chai_1.expect(selectedTabContent.hasClass("selcted"), "The selected tab (tab2) content was not selected.").to.be.true;
            chai_1.expect(selectedTabContent.is(":visible"), "The selected tab (tab2) content was not visible.").to.be.true;
        });
        it('Destroy', function () {
            navtabs.Tabs("Destroy");
            Tabs_1.Navigation.Tabs.RemoveFromJQuery(jQuery);
        });
    });
});
//# sourceMappingURL=Tabs.test.js.map
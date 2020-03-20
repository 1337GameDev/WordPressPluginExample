/// <reference path="../../lib/@types/jsdom/index.d.ts" />
/// <reference path="../../lib/@types/jQuery/index.d.ts" />
/// <reference path="./Test/global.d.ts" />

import { expect } from 'chai';
import 'mocha';
import {TestHelper} from './Test/TestHelper';
import {Navigation} from './Tabs';

describe('Options Class', () => {
    it('Constructor', () => {
        let o1 = new Navigation.TabOptions(true, false);
        let o2 = new Navigation.TabOptions(false);
        let o3 = new Navigation.TabOptions();

        expect(o1.returnJQuery, "Return jQuery field value was incorrect.").to.equal(true);
        expect(o1.loadCSS, "Load CSS field value was incorrect.").to.equal(false);

        expect(o2.returnJQuery, "Return jQuery field value was incorrect.").to.equal(false);
        expect(o2.loadCSS, "Load CSS field value was incorrect.").to.equal(true);

        expect(o3.returnJQuery, "Return jQuery field value was incorrect.").to.equal(false);
        expect(o3.loadCSS, "Load CSS field value was incorrect.").to.equal(true);
    });

    it('Defaults', () => {
        let o = Navigation.TabOptions.getDefaults();

        expect(o.returnJQuery, "Return jQuery field value was incorrect.").to.equal(false);
        expect(o.loadCSS, "Load CSS field value was incorrect.").to.equal(true);
    });

});

describe('Attached to JQuery', () => {
    let body = null;
    it('Preconditions', function () {
        expect(jQuery.fn.hasOwnProperty("Tabs"), "jQuery already has Tabs instance.").to.be.false;

        body = jQuery('body');
        expect(body.length, "Body was not found!").to.equal(1);
    });

    it('Attach', function () {
        expect(jQuery.fn.hasOwnProperty("Tabs"), "jQuery DOES have a Tabs instance before testing attaching.").to.be.false;
        Navigation.Tabs.AttachToJQuery(jQuery);
        expect(jQuery.fn.hasOwnProperty("Tabs"), "jQuery does NOT have a Tabs instance after testing attaching.").to.be.true;
    });

    it('Detach', function () {
        expect(jQuery.fn.hasOwnProperty("Tabs"), "jQuery does NOT have a Tabs instance before detaching.").to.be.true;
        Navigation.Tabs.RemoveFromJQuery(jQuery);
        expect(jQuery.fn.hasOwnProperty("Tabs"), "jQuery DOES have a Tabs instance after detaching.").to.be.false;
    });
});

describe('Instantiate', () => {
    let body = null;
    let navtabs = null;

    it('Preconditions', function () {
        expect(jQuery.fn.hasOwnProperty("Tabs"), "jQuery already has Tabs instance.").to.be.false;
        Navigation.Tabs.AttachToJQuery(jQuery);
    });

    it('Instantiate', function () {
        body = jQuery("body");
        navtabs = body.find("#testTabs");

        navtabs.Tabs();//default options
        expect(Navigation.Tabs.ElementHasInstance(navtabs), "The target1 element does NOT have a Tabs instance.").to.be.true;

    });

    it('Destroy', function () {
        navtabs.Tabs("Destroy");
        expect(Navigation.Tabs.ElementHasInstance(navtabs), "The target1 element does have a Tabs instance after being destroyed.").to.be.false;

        Navigation.Tabs.RemoveFromJQuery(jQuery);
    });
});

describe('Default Selected Tab', () => {
    let body = null;
    let navtabs = null;

    it('Preconditions', function () {
        Navigation.Tabs.AttachToJQuery(jQuery);
    });

    it('Instantiate', function () {
        body = jQuery("body");
        navtabs = body.find("#testTabs");

        navtabs.Tabs();//default options
        let defaultTab = navtabs.find("a.nav-tab:first-child");
        let defaultTabContent = navtabs.find(".navtab-content:first-child");

        expect(defaultTab.hasClass("selcted"), "The default tab was not selected.").to.be.true;
        expect(defaultTabContent.hasClass("selcted"), "The default tab content was not selected.").to.be.true;
        expect(defaultTabContent.is(":visible"), "The default tab content was not visible.").to.be.true;

    });

    it('Get Current Tab', function () {
        let currentTab = navtabs.Tabs("CurrentTab");

        expect(currentTab, "The default tab ('tab1') was not selected.").to.equal("tab1");
    });

    it('Select Tab / Get Tab', function () {
        navtabs.Tabs("SelectTab", "tab2");

        let currentTab = navtabs.Tabs("CurrentTab");
        let getTabElement = navtabs.Tabs("GetTab");
        let getTabContentElement = navtabs.Tabs("GetTabContentContainer");

        let selectedTab = navtabs.find("a.nav-tab:first-child");
        let selectedTabContent = navtabs.find(".navtab-content:first-child");

        expect(currentTab, "The selected tab was not 'tab2.'").to.equal("tab2");
        expect(getTabElement.data("tabname"), "The tab fetched was not 'tab2.'").to.equal("tab2");
        expect(selectedTabContent.data("tabname"), "The tab content fetched was not 'tab2.'").to.equal("tab2");

        expect(selectedTab.hasClass("selcted"), "The selected tab (tab2) was not selected.").to.be.true;
        expect(selectedTabContent.hasClass("selcted"), "The selected tab (tab2) content was not selected.").to.be.true;
        expect(selectedTabContent.is(":visible"), "The selected tab (tab2) content was not visible.").to.be.true;

    });

    it('Destroy', function () {
        navtabs.Tabs("Destroy");
        Navigation.Tabs.RemoveFromJQuery(jQuery);
    });
});

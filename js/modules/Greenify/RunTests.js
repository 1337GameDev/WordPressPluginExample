(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "mocha", "./Test/TestHelper", "glob", "path", "jsdom"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <reference path="../../lib/@types/jsdom/index.d.ts" />
    /// <reference path="../../lib/@types/jQuery/index.d.ts" />
    /// <reference path="./Test/global.d.ts" />
    require("mocha");
    var TestHelper_1 = require("./Test/TestHelper");
    var glob = require("glob");
    var path = require("path");
    var jsdom = require("jsdom");
    //functionally scope any data / operations used for setup
    (function () {
        var testHtmlFileContents = TestHelper_1.TestHelper.HtmlHelper.LoadTestHTML("testDom");
        //now that we've read the file
        var JSDOMOptions = {
            url: "http://localhost/"
        };
        var DOM = new jsdom.JSDOM(testHtmlFileContents, JSDOMOptions);
        //set up globals and jQuery variables
        global.window = DOM.window;
        global.document = DOM.window.document;
        global.$ = require('jquery');
        global.jQuery = global.$;
        //store any data to be made available during tests
        TestHelper_1.TestHelper.TestCacheData.AddToCache("TestDom", testHtmlFileContents);
    })();
    //now perform the tests
    describe(path.basename(__dirname), function () {
        beforeEach(function () {
            //this resets structure AND listeners
            document.getElementsByTagName('html')[0].innerHTML = TestHelper_1.TestHelper.TestCacheData.GetFromCache("TestDom");
        });
        afterEach(function () {
        });
        glob.sync(path.join(__dirname, "**", "*.test.js")).forEach(function (file) {
            require(path.resolve(file));
        });
    });
});
//# sourceMappingURL=RunTests.js.map
/// <reference path="../../lib/@types/jsdom/index.d.ts" />
/// <reference path="../../lib/@types/jQuery/index.d.ts" />
/// <reference path="./Test/global.d.ts" />
import 'mocha';
import {TestHelper} from './Test/TestHelper';
import * as glob from 'glob';
import * as path from 'path';
import * as jsdom from 'jsdom';

//functionally scope any data / operations used for setup
(function(){
    let testHtmlFileContents = TestHelper.HtmlHelper.LoadTestHTML("testDom");

    //now that we've read the file
    let JSDOMOptions = {
        url: "http://localhost/"
    };

    let DOM = new jsdom.JSDOM(testHtmlFileContents, JSDOMOptions);

    //set up globals and jQuery variables
    global.window = DOM.window;
    global.document = DOM.window.document;
    global.$ = require('jquery');
    global.jQuery = global.$;

    //store any data to be made available during tests
    TestHelper.TestCacheData.AddToCache("TestDom",testHtmlFileContents);
})();

//now perform the tests
describe(path.basename(__dirname), () => {
    beforeEach(function () {
        //this resets structure AND listeners
        document.getElementsByTagName('html')[0].innerHTML = TestHelper.TestCacheData.GetFromCache("TestDom");
    });

    afterEach(function(){
    });

    glob.sync(path.join(__dirname,"**","*.test.js")).forEach(function (file) {
        require(path.resolve(file));
    });
});
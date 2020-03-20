/// <reference types="jquery" />
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "jquery", "./Classes/GlobalWPPluginData", "./Classes/WPAjaxPayload", "./Classes/WPAjaxResponse", "./Classes/AJAX", "./Classes/Helper", "./Classes/TypeChecker", "./Classes/IndicatorUIHelper", "./Classes/LoaderUIHelper", "./Classes/ContextHelper", "./Classes/ElementGeneratorHelper", "./Classes/BrowserDetect", "./Contexts/admin/testplugin_Context"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var jQueryModule = require("jquery");
    var GlobalWPPluginData_1 = require("./Classes/GlobalWPPluginData");
    var WPAjaxPayload_1 = require("./Classes/WPAjaxPayload");
    var WPAjaxResponse_1 = require("./Classes/WPAjaxResponse");
    var AJAX_1 = require("./Classes/AJAX");
    var Helper_1 = require("./Classes/Helper");
    var TypeChecker_1 = require("./Classes/TypeChecker");
    var IndicatorUIHelper_1 = require("./Classes/IndicatorUIHelper");
    var LoaderUIHelper_1 = require("./Classes/LoaderUIHelper");
    var ContextHelper_1 = require("./Classes/ContextHelper");
    var ElementGeneratorHelper_1 = require("./Classes/ElementGeneratorHelper");
    var BrowserDetect_1 = require("./Classes/BrowserDetect");
    var testplugin_Context_1 = require("./Contexts/admin/testplugin_Context");
    var TestPlugin;
    (function (TestPlugin) {
        TestPlugin.GlobalWPPluginData = GlobalWPPluginData_1.GlobalWPPluginData;
        TestPlugin.PluginData = null;
        TestPlugin.WPAjaxPayload = WPAjaxPayload_1.WPAjaxPayload;
        TestPlugin.WPAjaxResponse = WPAjaxResponse_1.WPAjaxResponse;
        TestPlugin.ContextHelper = ContextHelper_1.ContextHelper;
        var Utilities = /** @class */ (function () {
            function Utilities() {
            }
            return Utilities;
        }());
        TestPlugin.Utilities = Utilities;
        (function (Utilities) {
            Utilities.AJAX = AJAX_1.AJAX;
            Utilities.Helper = Helper_1.Helper;
            Utilities.TypeChecker = TypeChecker_1.TypeChecker;
            Utilities.BrowserDetect = BrowserDetect_1.BrowserDetect;
            Utilities.LoaderUIHelper = LoaderUIHelper_1.LoaderUIHelper;
            Utilities.IndicatorUIHelper = IndicatorUIHelper_1.IndicatorUIHelper;
            Utilities.ElementGeneratorHelper = ElementGeneratorHelper_1.ElementGeneratorHelper;
        })(Utilities = TestPlugin.Utilities || (TestPlugin.Utilities = {}));
        /* Use these on pages when grouping data to be loaded for that page. Strongly types some fields / data to help prevent runtime issues. */
        var Contexts = /** @class */ (function () {
            function Contexts() {
            }
            return Contexts;
        }());
        TestPlugin.Contexts = Contexts;
        (function (Contexts) {
            var admin = /** @class */ (function () {
                function admin() {
                }
                return admin;
            }());
            Contexts.admin = admin;
            (function (admin) {
                admin.testplugin_Context = testplugin_Context_1.testplugin_Context;
            })(admin = Contexts.admin || (Contexts.admin = {}));
            var user = /** @class */ (function () {
                function user() {
                }
                return user;
            }());
            Contexts.user = user;
        })(Contexts = TestPlugin.Contexts || (TestPlugin.Contexts = {}));
        var Extensions = /** @class */ (function () {
            function Extensions() {
            }
            return Extensions;
        }());
        TestPlugin.Extensions = Extensions;
        /* Any custom events to help trigger customized functionality, but have some common method for triggering them */
        var Events = /** @class */ (function () {
            function Events() {
            }
            return Events;
        }());
        TestPlugin.Events = Events;
        (function (Events) {
            Events.MyEvent = new CustomEvent('customEvent', {
                bubbles: true
            });
        })(Events = TestPlugin.Events || (TestPlugin.Events = {}));
        function init(pluginData) {
            if (!pluginData) {
                throw new TypeError("The pluginData parameter was invalid.");
            }
            else {
                TestPlugin.PluginData = TestPlugin.GlobalWPPluginData.fromRawObj(pluginData);
            }
            setJQueryDefaults(jQueryModule);
        }
        TestPlugin.init = init;
        function attachHandlers() {
            var body = jQuery("body");
            //body.on("click",".testClass",function(){});
            body.on("click", ".linkButton", function () {
                var $this = jQuery(this);
                var urlToOpen = $this.data('link-to-open');
                var urlTarget = $this.data('open-target');
                if (TestPlugin.Utilities.TypeChecker.isEmpty(urlToOpen)) {
                    return;
                }
                if (TestPlugin.Utilities.TypeChecker.isEmpty(urlTarget)) {
                    urlTarget = "current";
                }
                switch (urlTarget) {
                    case "new":
                        TestPlugin.Utilities.Helper.openInNewTab(urlToOpen);
                        break;
                    default:
                        window.location.href = urlToOpen;
                }
            });
        }
        TestPlugin.attachHandlers = attachHandlers;
        function setJQueryDefaults(jq) {
            //set ajax defaults
            var jsonMimeType = "application/json;charset=UTF-8";
            jq.ajaxSetup({
                type: "POST",
                url: TestPlugin.PluginData.ajaxurl,
                dataType: "json",
                traditional: true,
                error: TestPlugin.Utilities.AJAX.standardAjaxError,
                beforeSend: function (x) {
                    if (x && x.overrideMimeType) {
                        x.overrideMimeType(jsonMimeType);
                    }
                },
            });
            jq(this).ajaxSuccess(function (event, request) {
                var data = request.responseJSON;
                if (!TestPlugin.Utilities.TypeChecker.isUndefined(data.newNonce)) {
                    TestPlugin.PluginData.nonce = data.newNonce;
                }
            });
            TestPlugin.Utilities.Helper.addCustomValidators(jQuery);
        }
        TestPlugin.setJQueryDefaults = setJQueryDefaults;
    })(TestPlugin = exports.TestPlugin || (exports.TestPlugin = {}));
});
//# sourceMappingURL=TestPlugin.js.map
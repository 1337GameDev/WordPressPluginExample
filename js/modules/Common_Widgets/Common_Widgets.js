(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "jquery", "./Classes/GlobalWidgetSettings", "./Classes/SingleEditField", "./Classes/FileDropArea", "./Classes/Helper", "./Classes/ChoiceButton", "./Classes/WidgetBase"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <reference path="../../lib/@types/jquery/index.d.ts" />
    var jQueryModule = require("jquery");
    var GlobalWidgetSettings_1 = require("./Classes/GlobalWidgetSettings");
    var SingleEditField_1 = require("./Classes/SingleEditField");
    var FileDropArea_1 = require("./Classes/FileDropArea");
    var Helper_1 = require("./Classes/Helper");
    var ChoiceButton_1 = require("./Classes/ChoiceButton");
    var WidgetBase_1 = require("./Classes/WidgetBase");
    var CommonWidgets;
    (function (CommonWidgets) {
        //export classes to expose them as types
        CommonWidgets.WidgetBaseClass = WidgetBase_1.WidgetBase;
        CommonWidgets.ChoiceButtonClass = ChoiceButton_1.ChoiceButton;
        CommonWidgets.SingleEditFieldClass = SingleEditField_1.SingleEditField;
        CommonWidgets.FileDropAreaClass = FileDropArea_1.FileDropArea;
        CommonWidgets.GlobalWidgetSettings = new GlobalWidgetSettings_1.GlobalWidgetSettings();
        function attachToJQuery(jq) {
            Helper_1.Helper.AddJQueryNamespaceFunction(jq);
            jQueryModule.namespace('CommonWidgets', {
                SetAsReadOnly: function () {
                    Helper_1.Helper.SetAsReadOnly(jq(this));
                },
                RemoveReadOnly: function () {
                    Helper_1.Helper.RemoveReadOnly(jq(this));
                },
                SetAsDisabled: function () {
                    Helper_1.Helper.SetAsDisabled(jq(this));
                },
                RemoveDisabled: function () {
                    Helper_1.Helper.RemoveDisabled(jq(this));
                },
                removeClassesWithPrefix: function (prefix) {
                    return Helper_1.Helper.removeClassesWithPrefix(jq(this), prefix);
                },
                setDependencyWarningMessageDisplay: function (showMessages) {
                    GlobalWidgetSettings_1.GlobalWidgetSettings.dependencyWarningMessageDisplay = showMessages;
                },
                custom_multiselect: function (options) {
                    return Helper_1.Helper.custom_multiselect(jq(this), options);
                },
                custom_bootstrap_select: function (options) {
                    return Helper_1.Helper.custom_bootstrap_select(jq(this), options);
                },
            });
            jq = SingleEditField_1.SingleEditField.AttachToJQuery(jq);
            jq = ChoiceButton_1.ChoiceButton.AttachToJQuery(jq);
            jq = FileDropArea_1.FileDropArea.AttachToJQuery(jq);
        }
        CommonWidgets.attachToJQuery = attachToJQuery;
    })(CommonWidgets = exports.CommonWidgets || (exports.CommonWidgets = {}));
    CommonWidgets.attachToJQuery(jQueryModule);
    WidgetBase_1.WidgetBase.performSingleLoadOperations();
    jQueryModule(function () {
        //any special handlers
        var body = jQueryModule("body");
        body.on("click", '.dropdown-submenu a.open-submenu', function (e) {
            jQueryModule(this).next('ul').toggle();
            e.stopPropagation();
            e.preventDefault();
        });
        body.on("click", '.preventEventBubble', function (e) {
            e.stopPropagation();
            e.preventDefault();
        });
    });
});
//# sourceMappingURL=Common_Widgets.js.map
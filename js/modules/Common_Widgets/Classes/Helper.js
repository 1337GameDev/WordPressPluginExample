(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "jquery", "../Common_Widgets", "./WidgetBase"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var jQueryModule = require("jquery");
    var Common_Widgets_1 = require("../Common_Widgets");
    var WidgetBase_1 = require("./WidgetBase");
    var Helper = /** @class */ (function () {
        function Helper() {
        }
        Helper.copyFieldsFromTo = function (from, to) {
            var result = {};
            Object.keys(to).forEach(function (key) {
                //now copy that key+value to the "to" object
                result[key] = to[key];
            });
            Object.keys(from).forEach(function (key) {
                //now copy that key+value to the "to" object
                result[key] = from[key];
            });
            return result;
        };
        Helper.hasProperty = function (obj, prop) {
            return Object.prototype.hasOwnProperty.call(obj, prop);
        };
        Helper.ShowWidgetNotification = function (title, msg, type, icon) {
            if (title === void 0) { title = ''; }
            if (msg === void 0) { msg = ''; }
            if (type === void 0) { type = ''; }
            if (icon === void 0) { icon = ''; }
            if (typeof jQueryModule.notify === 'undefined') {
                console.warn("The \"Notify JS\" library is not found, and a widget notification was attempted. Please include it to enable widget notifications. The message to notify was \"" + msg + "\".");
                return;
            }
            var parameterIconPresent = (icon !== '');
            var options = {
                title: "Unknown Title",
                message: "Unknown Message"
            };
            var settings = jQueryModule.extend(true, {}, Common_Widgets_1.CommonWidgets.GlobalWidgetSettings.Notifications);
            if (title !== '') {
                options.title = title;
            }
            if (msg !== '') {
                options.message = msg;
            }
            if (parameterIconPresent) {
                options.icon = icon; //conditionally add this item to the options (to override the default)
            }
            if (type === '' || (type !== 'success' && type !== 'info' && type !== 'warning' && type !== 'danger')) {
                type = 'info'; //default to info if one isn't provided (or provided value is invalid)
            }
            settings.type = 'pastel-' + type;
            switch (type) {
                case 'success':
                    if (!parameterIconPresent) {
                        options.icon = 'fa fa-check-circle';
                    }
                    break;
                case 'info':
                    if (!parameterIconPresent) {
                        options.icon = 'fa fa-info-circle';
                    }
                    break;
                case 'warning':
                    if (!parameterIconPresent) {
                        options.icon = 'fa fa-exclamation-triangle';
                    }
                    break;
                case 'danger':
                    if (!parameterIconPresent) {
                        options.icon = 'fa fa-exclamation';
                    }
                    break;
                default:
            }
            jQueryModule.notify(options, settings);
        }; //ShowWidgetNotification function
        Helper.SetShowTooltips = function (showTooltips) {
            Helper.ActiveWidgets.forEach(function (widget) {
                if (widget instanceof WidgetBase_1.WidgetBase) {
                    if (!showTooltips) {
                        //remove tooltipster from all widgets
                        widget.DisableTooltips();
                    }
                    else {
                        //enable tooltipster to all widgets
                        widget.EnableTooltips();
                    }
                }
            });
        };
        Helper.RegisterWidget = function (widget) {
            Helper.ActiveWidgets.push(widget);
        };
        Helper.UnregisterWidget = function (widget) {
            var indexOf = Helper.ActiveWidgets.findIndex(function (element, index, array) {
                return widget === element;
            });
            if (indexOf > -1) {
                Helper.ActiveWidgets.splice(indexOf, 1);
            }
        };
        Helper.GetPropertiesOfObjectOnly = function (obj) {
            var output = {};
            for (var property in obj) {
                if (obj.hasOwnProperty(property) && (typeof obj[property] !== 'function')) {
                    output[property] = obj[property];
                }
            }
            return output;
        };
        Helper.GetDataIfPresent = function (element, dataName, dataObjectExpected) {
            if (dataObjectExpected === void 0) { dataObjectExpected = null; }
            var data = null;
            if (element.data().hasOwnProperty(dataName)) {
                data = element.data(dataName);
                var compareToType = (typeof dataObjectExpected !== 'undefined') && (dataObjectExpected !== null);
                if ((typeof data === 'undefined') || (data === null) && (!compareToType || (data.constructor !== dataObjectExpected.constructor))) {
                    data = null;
                }
            }
            return data;
        };
        //A function to call a function parameter if the function is NOT null/undefined
        //Will also accept a parameter for the function, OR a parameter list
        Helper.ExecuteIfDefined = function (func, args) {
            if (Helper.FunctionDefined(func)) {
                if (typeof args !== 'undefined') {
                    if ((typeof args === 'object') && (args.constructor === Array)) {
                        //forces the "this" reference of a function to the global instance, as well as expanding the list of arguments
                        //eg: passing in [1,2,3] for args will be the same as: func(1,2,3)
                        func.apply(null, args);
                    }
                    else { //must be single value then
                        func(args);
                    }
                }
                else {
                    func();
                }
            }
        };
        Helper.FunctionDefined = function (fn) {
            return ((fn !== null) && (typeof fn !== 'undefined') && (typeof fn === 'function'));
        };
        /**
         * Adds a "resize" button to this moal, to rotate through size classes (targetted via css)
         * @param {any} modal The modal (jQuery Confirm instance) to resize
         * @param {any[]} resizeSettings The array of objects representing each size / icon for the resize button.
         *
         * NOTE: The size objects must be like the below:
         * {
         *      sizeClasses: ["class1","class2"],
         *      iconClass: "resizeButtonClass1"
         * }
         */
        Helper.addResizeButtonToModal = function (modal, resizeSettings) {
            if ((typeof modal === 'undefined') || (modal === null) || (typeof resizeSettings === 'undefined') || (resizeSettings === null) || (resizeSettings.length === 0)) {
                return;
            }
            var modalBody = modal.$body;
            var modalContainer = modalBody.parents(".jc-bs3-container");
            modalContainer.addClass("modal-resize-enabled");
            var closeButton = modalBody.find(".jconfirm-closeIcon");
            var resizeButton = jQueryModule("<div class='modal-resize-button' title='Resize'><i class='fa ' aria-hidden='true'></i></div>");
            closeButton.before(resizeButton);
            modalBody.on("click", ".modal-resize-button", Helper.resizeModalButtonClick);
            resizeButton.data("currentSizeIndex", 0);
            resizeButton.data("sizes", resizeSettings);
            //Add a Tooltip
            if (typeof jQueryModule.tooltipster !== 'undefined') {
                var tooltip = resizeButton.tooltipster();
                tooltip.tooltipster("enable");
            }
            else {
                console.warn("The jQuery plugin 'Tooltipster' was not found. Please include it to enable tool-tips for this modal resize button.");
            }
            //set current modal size
            Helper.addSizeClasses(modalBody, resizeSettings[0]);
        };
        Helper.resizeModalButtonClick = function () {
            var $this = jQueryModule(this);
            var currentSizeIdx = $this.data("currentSizeIndex");
            var sizeArrays = $this.data("sizes");
            var modelBody = $this.parents(".jconfirm-box");
            Helper.removeSizeClasses(modelBody, sizeArrays[currentSizeIdx]); //remove existing size classes
            currentSizeIdx = (currentSizeIdx + 1) % sizeArrays.length; //increment, but constrain index to within the sizes array
            Helper.addSizeClasses(modelBody, sizeArrays[currentSizeIdx]);
            $this.data("currentSizeIndex", currentSizeIdx); //update the index for next time
        };
        Helper.addSizeClasses = function (modalBody, sizeSetting) {
            var modelRoot = modalBody.parents(".jconfirm-box-container");
            var resizeButton = modalBody.find(".modal-resize-button");
            modelRoot.addClass(sizeSetting.sizeClasses);
            resizeButton.find("i").addClass(sizeSetting.iconClass);
        };
        Helper.removeSizeClasses = function (modalBody, currentSizeSetting) {
            var modelRoot = modalBody.parents(".jconfirm-box-container");
            var resizeButton = modalBody.find(".modal-resize-button");
            modelRoot.removeClass(currentSizeSetting.sizeClasses);
            resizeButton.find("i").removeClass(currentSizeSetting.iconClass);
        };
        Helper.removeClassesWithPrefix = function ($target, prefix) {
            $target.each(function (i, el) {
                var classes = el.className.split(" ").filter(function (c) {
                    return c.lastIndexOf(prefix, 0) !== 0;
                });
                el.className = classes.join(" ");
            });
            return $target;
        };
        Helper.custom_multiselect = function ($target, options) {
            if (typeof $target === 'undefined' || !jQueryModule.fn.hasOwnProperty('multiselect')) {
                return $target;
            }
            if ((typeof options === 'undefined') || (options === null)) {
                options = {};
            }
            var maxSelected = $target.data("max-selected-options");
            if ((typeof $target.data("max-selected-options") === 'undefined') || ($target.data("max-selected-options") === null)) {
                maxSelected = $target.find("option:not([disabled])");
            }
            else if ((maxSelected === "*") || (maxSelected < 0)) {
                maxSelected = 0;
            }
            var defaultOptions = {
                nonSelectedText: 'Please select one or many',
                enableHTML: false
            };
            //onChange
            var enableDisableBasedOnMax = function () {
                // Get selected options
                var selectedOptions = $target.find('option:selected');
                if (selectedOptions.length >= maxSelected) {
                    // Disable all other inputs
                    var nonSelectedOptions = $target.find('option:not(:selected)');
                    nonSelectedOptions.each(function () {
                        var input = jQueryModule('input[value="' + jQueryModule(this).val() + '"]');
                        input.prop('disabled', true);
                        input.closest('li').addClass('disabled');
                    });
                }
                else {
                    // Enable all inputs
                    $target.find('option').each(function () {
                        var input = jQueryModule('input[value="' + jQueryModule(this).val() + '"]');
                        input.prop('disabled', false);
                        input.closest('li').removeClass('disabled');
                    });
                }
            }; //onChange
            defaultOptions.onChange = enableDisableBasedOnMax;
            var dropDownHidden = function (event) {
                $target.trigger("focusout");
            };
            defaultOptions.onDropdownHidden = dropDownHidden;
            //combine any functions we want to "add" as handlers for the multiselect
            if (options.hasOwnProperty("onChange")) {
                if (maxSelected > 0) {
                    options.onChange = function (option, checked, select) {
                        enableDisableBasedOnMax();
                        options.onChange(option, checked, select);
                    };
                }
            }
            if (options.hasOwnProperty("onDropdownHidden")) {
                options.onDropdownHidden = function (event) {
                    dropDownHidden(event);
                    options.onDropdownHidden(event);
                };
            }
            var combinedSettings = jQueryModule.extend({}, defaultOptions, options);
            $target.multiselect(combinedSettings);
            $target.data("multiselect-options", combinedSettings);
            enableDisableBasedOnMax();
        };
        Helper.custom_bootstrap_select = function ($target, options) {
            if (typeof $target === 'undefined' || !jQueryModule.fn.hasOwnProperty('selectpicker')) {
                return $target;
            }
            if ((typeof options === 'undefined') || (options === null)) {
                options = {};
            }
            var defaultOptions = {
                iconBase: "fa",
                tickIcon: "fa-check",
                actionsBox: true
            };
            var combinedSettings = jQueryModule.extend({}, defaultOptions, options);
            $target.selectpicker(combinedSettings); //we know this function exists, despite types, because we checked it above
            if (Helper.ElementInDOM($target)) {
                $target.data("selectpicker-options", combinedSettings);
            }
            else {
                $target.attr("data-selectpicker-options", combinedSettings);
            }
        };
        Helper.ElementInDOM = function ($element) {
            return jQueryModule.contains(document, $element[0]);
        };
        //the method to call when the field should be set as read-only
        Helper.SetAsReadOnly = function (element) {
            if (!element.hasClass("readonly")) {
                element.addClass("readonly");
            }
            element.prop("readonly", "readonly");
        };
        //the method to call when the field should NOT be set as read-only
        Helper.RemoveReadOnly = function (element) {
            if (element.hasClass("readonly")) {
                element.removeClass("readonly");
            }
            element.removeAttr("readonly");
        };
        //the method to call when the field should be set as disabled
        Helper.SetAsDisabled = function (element) {
            if (!element.hasClass("disabled")) {
                element.addClass("disabled");
            }
            element.prop("disabled", "disabled");
        };
        //the method to call when the field should NOT be set as disabled
        Helper.RemoveDisabled = function (element) {
            if (element.hasClass("disabled")) {
                element.removeClass("disabled");
            }
            element.removeAttr("disabled");
        };
        //A function to call a function parameter if the function is NOT null/undefined
        //Will also accept a parameter for the function, OR a parameter list
        //the function type can accept ANY number of args (even none/undefined) and return a variety of things
        Helper.ExecuteFunctionIfDefined = function (func, args) {
            if ((func !== null) && (typeof func !== 'undefined') && (typeof func === 'function')) {
                if (args) {
                    if ((typeof args === 'object') && (args.constructor === Array)) {
                        //forces the "this" reference of a function to the global instance, as well as expanding the list of arguments
                        //eg: passing in [1,2,3] for args will be the same as: func(1,2,3)
                        func.apply(null, args);
                    }
                    else { //must be single value then
                        func(args);
                    }
                }
                else {
                    func();
                }
            }
        };
        Helper.AddJQueryNamespaceFunction = function (jq) {
            if (!jq.fn.hasOwnProperty("namespace")) {
                jq.extend({
                    namespace: function (ns, functions) {
                        this.fn[ns] = function () { return this.extend(functions); };
                    }
                });
                //default namespaces
                jq.namespace('$', jq.fn); // the default namespace
                jq.namespace('jQuery', jq.fn); // the default namespace
            }
        };
        Helper.FormatBytes = function (bytes, decimals) {
            if (decimals === void 0) { decimals = 2; }
            if (bytes === 0) {
                return '0 Bytes';
            }
            var k = 1024;
            var dm = decimals < 0 ? 0 : decimals;
            var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
            var i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
        };
        Helper.ActiveWidgets = [];
        return Helper;
    }());
    exports.Helper = Helper;
});
//# sourceMappingURL=Helper.js.map
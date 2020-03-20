import * as jQueryModule from 'jquery';
import {DynamicObject} from "./DynamicObject";
import {CommonWidgets} from "../Common_Widgets";
import {WidgetBase} from "./WidgetBase";

export class Helper {
    public static ActiveWidgets = [];

    public static copyFieldsFromTo(from:DynamicObject,to:DynamicObject):DynamicObject {
        let result:DynamicObject = {};
        Object.keys(to).forEach(key => {
            //now copy that key+value to the "to" object
            result[key] = to[key];
        });

        Object.keys(from).forEach(key => {
            //now copy that key+value to the "to" object
            result[key] = from[key];
        });

        return result;
    }

    public static hasProperty(obj:any, prop:string):boolean {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    }

    public static ShowWidgetNotification(title:string = '', msg:string = '', type:string = '', icon:string = '') {
        if (typeof jQueryModule.notify === 'undefined') {
            console.warn("The \"Notify JS\" library is not found, and a widget notification was attempted. Please include it to enable widget notifications. The message to notify was \"" + msg + "\".");
            return;
        }

        let parameterIconPresent = (icon !== '');

        let options:DynamicObject = {
            title: "Unknown Title",
            message: "Unknown Message"
        };

        let settings = jQueryModule.extend(true, {}, CommonWidgets.GlobalWidgetSettings.Notifications);

        if (title !== '') {
            options.title = title;
        }
        if (msg !== '') {
            options.message = msg;
        }
        if (parameterIconPresent) {
            options.icon = icon;//conditionally add this item to the options (to override the default)
        }

        if (type === '' || (type !== 'success' && type !== 'info' && type !== 'warning' && type !== 'danger')) {
            type = 'info';//default to info if one isn't provided (or provided value is invalid)
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
    }//ShowWidgetNotification function

    public static SetShowTooltips(showTooltips:boolean) {
        Helper.ActiveWidgets.forEach(function (widget) {
            if (widget instanceof WidgetBase) {
                if (!showTooltips) {
                    //remove tooltipster from all widgets
                    widget.DisableTooltips();
                } else {
                    //enable tooltipster to all widgets
                    widget.EnableTooltips();
                }
            }
        });
    }

    public static RegisterWidget(widget: WidgetBase) {
        Helper.ActiveWidgets.push(widget);
    }

    public static UnregisterWidget(widget: WidgetBase) {
        let indexOf = Helper.ActiveWidgets.findIndex(
            function (element, index, array) {
                return widget === element;
            }
        );

        if(indexOf > -1) {
            Helper.ActiveWidgets.splice(indexOf, 1);
        }
    }

    public static GetPropertiesOfObjectOnly(obj:any) {
        let output = {};
        for (let property in obj) {
            if (obj.hasOwnProperty(property) && (typeof obj[property] !== 'function')) {
                output[property] = obj[property];
            }
        }

        return output;
    }

    public static GetDataIfPresent(element:JQuery, dataName:string, dataObjectExpected:any = null) {//gets data from an element if valid (and if a value is passed in 'dataObjectExpected' object type is checked), or returns null of invalid
        let data = null;
        if (element.data().hasOwnProperty(dataName)) {
            data = element.data(dataName);
            let compareToType = (typeof dataObjectExpected !== 'undefined') && (dataObjectExpected !== null);

            if ((typeof data === 'undefined') || (data === null) && (!compareToType || (data.constructor !== dataObjectExpected.constructor))) {
                data = null;
            }

        }

        return data;
    }

    //A function to call a function parameter if the function is NOT null/undefined
    //Will also accept a parameter for the function, OR a parameter list
    public static ExecuteIfDefined(func, args) {
        if (Helper.FunctionDefined(func) ) {
            if (typeof args !== 'undefined') {
                if ((typeof args === 'object') && (args.constructor === Array)) {
                    //forces the "this" reference of a function to the global instance, as well as expanding the list of arguments
                    //eg: passing in [1,2,3] for args will be the same as: func(1,2,3)
                    func.apply(null, args);

                } else {//must be single value then
                    func(args);
                }
            } else {
                func();
            }
        }
    }

    public static FunctionDefined(fn) {
        return ((fn !== null) && (typeof fn !== 'undefined') && (typeof fn === 'function'));
    }

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
    public static addResizeButtonToModal(modal, resizeSettings) {
        if ((typeof modal === 'undefined') || (modal === null) || (typeof resizeSettings === 'undefined') || (resizeSettings === null) || (resizeSettings.length === 0)) {
            return;
        }

        let modalBody = modal.$body;
        let modalContainer = modalBody.parents(".jc-bs3-container");
        modalContainer.addClass("modal-resize-enabled");

        let closeButton = modalBody.find(".jconfirm-closeIcon");
        let resizeButton = jQueryModule("<div class='modal-resize-button' title='Resize'><i class='fa ' aria-hidden='true'></i></div>");

        closeButton.before(resizeButton);
        modalBody.on("click", ".modal-resize-button", Helper.resizeModalButtonClick);

        resizeButton.data("currentSizeIndex", 0);
        resizeButton.data("sizes", resizeSettings);

        //Add a Tooltip
        if (typeof jQueryModule.tooltipster !== 'undefined') {
            let tooltip = resizeButton.tooltipster();
            tooltip.tooltipster("enable");
        } else {
            console.warn("The jQuery plugin 'Tooltipster' was not found. Please include it to enable tool-tips for this modal resize button.");
        }

        //set current modal size
        Helper.addSizeClasses(modalBody, resizeSettings[0]);
    }

    public static resizeModalButtonClick() {
        let $this = jQueryModule(this);
        let currentSizeIdx = $this.data("currentSizeIndex");
        let sizeArrays = $this.data("sizes");
        let modelBody = $this.parents(".jconfirm-box");

        Helper.removeSizeClasses(modelBody, sizeArrays[currentSizeIdx]);//remove existing size classes
        currentSizeIdx = (currentSizeIdx + 1) % sizeArrays.length;//increment, but constrain index to within the sizes array
        Helper.addSizeClasses(modelBody, sizeArrays[currentSizeIdx]);

        $this.data("currentSizeIndex", currentSizeIdx);//update the index for next time
    }


    public static addSizeClasses(modalBody, sizeSetting) {
        let modelRoot = modalBody.parents(".jconfirm-box-container");
        let resizeButton = modalBody.find(".modal-resize-button");

        modelRoot.addClass(sizeSetting.sizeClasses);
        resizeButton.find("i").addClass(sizeSetting.iconClass);
    }

    public static removeSizeClasses(modalBody, currentSizeSetting) {
        let modelRoot = modalBody.parents(".jconfirm-box-container");
        let resizeButton = modalBody.find(".modal-resize-button");

        modelRoot.removeClass(currentSizeSetting.sizeClasses);
        resizeButton.find("i").removeClass(currentSizeSetting.iconClass);
    }

    public static removeClassesWithPrefix($target:JQuery, prefix:string):JQuery {
        $target.each(function (i, el) {
            let classes = el.className.split(" ").filter(function (c) {
                return c.lastIndexOf(prefix, 0) !== 0;
            });
            el.className = classes.join(" ");
        });
        return $target;
    }

    public static custom_multiselect($target:JQuery, options:DynamicObject) {
        if(typeof $target === 'undefined' || !jQueryModule.fn.hasOwnProperty('multiselect')) {
            return $target;
        }

        if((typeof options === 'undefined') || (options === null)) {
            options = {};
        }

        let maxSelected = $target.data("max-selected-options");
        if ((typeof $target.data("max-selected-options") === 'undefined') || ($target.data("max-selected-options") === null) ) {
            maxSelected = $target.find("option:not([disabled])");
        } else if ((maxSelected === "*") || (maxSelected < 0) ) {
            maxSelected = 0;
        }

        let defaultOptions:DynamicObject = {
            nonSelectedText: 'Please select one or many',
            enableHTML: false
        };

        //onChange
        let enableDisableBasedOnMax = function () {
            // Get selected options
            let selectedOptions = $target.find('option:selected');

            if (selectedOptions.length >= maxSelected) {
                // Disable all other inputs
                let nonSelectedOptions = $target.find('option:not(:selected)');

                nonSelectedOptions.each(function () {
                    let input = jQueryModule('input[value="' + jQueryModule(this).val() + '"]');
                    input.prop('disabled', true);
                    input.closest('li').addClass('disabled');
                });

            } else {
                // Enable all inputs
                $target.find('option').each(function () {
                    let input = jQueryModule('input[value="' + jQueryModule(this).val() + '"]');
                    input.prop('disabled', false);
                    input.closest('li').removeClass('disabled');
                });

            }
        };//onChange
        defaultOptions.onChange = enableDisableBasedOnMax;

        let dropDownHidden = function (event) {
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

        let combinedSettings = jQueryModule.extend({}, defaultOptions, options);

        $target.multiselect(combinedSettings);
        $target.data("multiselect-options", combinedSettings);
        enableDisableBasedOnMax();
    }

    public static custom_bootstrap_select($target:JQuery, options:DynamicObject) {
        if(typeof $target === 'undefined' || !jQueryModule.fn.hasOwnProperty('selectpicker')) {
            return $target;
        }

        if((typeof options === 'undefined') || (options === null)) {
            options = {};
        }

        let defaultOptions:DynamicObject = {
            iconBase: "fa",
            tickIcon: "fa-check",
            actionsBox: true
        };

        let combinedSettings = jQueryModule.extend({}, defaultOptions, options);

        (<any>$target).selectpicker(combinedSettings);//we know this function exists, despite types, because we checked it above

        if(Helper.ElementInDOM($target)) {
            $target.data("selectpicker-options", combinedSettings);
        } else {
            $target.attr("data-selectpicker-options", combinedSettings);
        }

    }

    public static ElementInDOM($element: JQuery){
        return jQueryModule.contains(document, $element[0]);
    }

    //the method to call when the field should be set as read-only
    public static SetAsReadOnly(element:JQuery) {
        if (!element.hasClass("readonly")) {
            element.addClass("readonly");
        }

        element.prop("readonly", "readonly");
    }

    //the method to call when the field should NOT be set as read-only
    public static RemoveReadOnly(element:JQuery) {
        if (element.hasClass("readonly")) {
            element.removeClass("readonly");
        }

        element.removeAttr("readonly");
    }

    //the method to call when the field should be set as disabled
    public static SetAsDisabled(element:JQuery) {
        if (!element.hasClass("disabled")) {
            element.addClass("disabled");
        }

        element.prop("disabled", "disabled");
    }

    //the method to call when the field should NOT be set as disabled
    public static RemoveDisabled(element:JQuery) {
        if (element.hasClass("disabled")) {
            element.removeClass("disabled");
        }

        element.removeAttr("disabled");
    }

    //A function to call a function parameter if the function is NOT null/undefined
    //Will also accept a parameter for the function, OR a parameter list
    //the function type can accept ANY number of args (even none/undefined) and return a variety of things
    public static ExecuteFunctionIfDefined(func:(...args: any[]) => any, args:any) {
        if ((func !== null) && (typeof func !== 'undefined') && (typeof func === 'function')) {
            if (args) {
                if ((typeof args === 'object') && (args.constructor === Array)) {
                    //forces the "this" reference of a function to the global instance, as well as expanding the list of arguments
                    //eg: passing in [1,2,3] for args will be the same as: func(1,2,3)
                    func.apply(null, args);

                } else {//must be single value then
                    func(args);
                }
            } else {
                func();
            }
        }
    }

    public static AddJQueryNamespaceFunction(jq: JQueryStatic) {
        if(!jq.fn.hasOwnProperty("namespace")) {
            jq.extend({
                namespace: function(ns, functions){
                    this.fn[ns] = function() {return this.extend(functions);};
                }
            });

            //default namespaces
            jq.namespace('$', jq.fn); // the default namespace
            jq.namespace('jQuery', jq.fn); // the default namespace
        }
    }

    public static FormatBytes(bytes:number, decimals:number = 2):string {
        if (bytes === 0) {
            return '0 Bytes'
        }

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
}

declare global {
    interface JQuery {
        notify(options:any, settings:any):any;
        multiselect(...params:any):any;
        tooltipster(...params:any):any;
        namespace(ns:string, functions:object):object;
    }

    interface JQueryStatic {
        notify(options:any, settings:any):any;
        multiselect(...params:any):any;
        tooltipster(...params:any):any;
        namespace(ns:string, functions:object):object;
    }
}
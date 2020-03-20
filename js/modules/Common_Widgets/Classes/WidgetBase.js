(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Helper", "jquery", "./TypeChecker"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Helper_1 = require("./Helper");
    var jQueryModule = require("jquery");
    var TypeChecker_1 = require("./TypeChecker");
    /*
     * The Widget base class. Should be used whenever making a new widget
     */
    var WidgetBase = /** @class */ (function () {
        function WidgetBase(target, settings, otherDefaults) {
            if (otherDefaults === void 0) { otherDefaults = []; }
            this.settings = null;
            this.targetElement = null; //the element this widget was called on
            this.widgetRootContainer = null;
            this.widgetRoot = null;
            /** A mechanism to signify that this plugin has been deleted -- to avoid use by stale references */
            this.deleted = false;
            /** A cache for data used to store parts of the unmodified target element for use when this widget is destroyed */
            this.originalElementState = {};
            /** A cache for methods that are accessible by the jQuery attached constructor, or the "Call" method. These methods are called via their string names */
            this.exposedMethods = null;
            if (target.length === 0) {
                console.warn("The target for this WidgetBase was empty.");
                return;
            }
            //build the array of methods you want to expose
            this.exposedMethods = {
                "Destroy": this.Destroy,
                "DisableTooltips": this.DisableTooltips,
                "DestroyTooltips": this.DestroyTooltips,
                "EnableTooltips": this.EnableTooltips,
                "SetShowTooltips": this.SetShowTooltips,
                "GetTargetElement": this.GetTargetElement
            };
            //extend the defaults!
            this.settings = jQueryModule.extend({}, WidgetBase.baseDefaultOptions, otherDefaults, settings);
            this.widgetType = this.constructor.name;
            Helper_1.Helper.RegisterWidget(this);
            target.addClass("hasWidget");
            this.targetElement = target;
            this.widgetRootContainer = target.parent();
        }
        WidgetBase.performSingleLoadOperations = function () {
            if (WidgetBase.loadedOnce) {
                return;
            }
            var thisObj = this;
            if (thisObj.baseDefaultOptions["loadCSS"]) {
                //use require-css to include our plugin's custom css file
                require(['css!modules/Common_Widgets/css/Common_Widgets']);
            }
            WidgetBase.loadedOnce = true;
        };
        WidgetBase.prototype.GetTargetElement = function () {
            return this.targetElement;
        };
        /**
         * This method is used internally of this plugin to attach it's own handlers
         */
        WidgetBase.prototype.AttachHandlers = function () {
            if (this.deleted) {
                return;
            }
            var that = this;
            //this is deprecated and a MutationObserver should be used instead.
            this.targetElement.on("DOMNodeRemoved", function () {
                that.Destroy();
            });
        };
        /**
         * This method is used internally of this plugin to remove it's own handlers it attached via {@link WidgetBase.AttachHandlers}
         */
        WidgetBase.prototype.RemoveHandlers = function () {
            if (this.deleted) {
                return;
            }
            //this is deprecated and a MutationObserver should be used instead.
            this.targetElement.off("DOMNodeRemoved");
        };
        /**
         * This method is used internally of this plugin to perform actions during its instantiation
         */
        WidgetBase.prototype.OnCreate = function () {
            if (this.deleted) {
                return;
            }
        };
        /**
         * This method is used (and can be called publicly) to undo actions performed when the widget is created
         */
        WidgetBase.prototype.Destroy = function () {
            if (this.deleted) {
                return;
            }
            this.RemoveHandlers();
            this.DestroyTooltips();
            var classConstructor = this.constructor;
            //remove the data instance from this element
            this.targetElement.removeData(classConstructor.widgetDataName);
            this.RestoreElementState();
            for (var propName in this) {
                if (this.hasOwnProperty(propName)) {
                    delete this[propName];
                }
            }
            Helper_1.Helper.UnregisterWidget(this);
            this.deleted = true;
        };
        //override in children
        WidgetBase.prototype.DisableTooltips = function () {
            console.log("DisableTooltips: true");
            return true;
        };
        //override in children
        WidgetBase.prototype.DestroyTooltips = function () {
            console.log("DestroyTooltips: true");
            return true;
        };
        //override in children
        WidgetBase.prototype.EnableTooltips = function () {
            console.log("EnableTooltips: true");
            return true;
        };
        //the method to call to show/hide tooltips based on an input boolean
        WidgetBase.prototype.SetShowTooltips = function (showTooltips) {
            if (this.deleted) {
                return;
            }
            this.settings.showTooltips = showTooltips;
            if (showTooltips) {
                this.EnableTooltips();
            }
            else {
                this.DisableTooltips();
            }
        };
        /**
         * Call an exposed method {@link Visuals.Greenify.exposedMethods}
         * @param {string} methodName - The method name to call (as a string)
         * @param {any} [args] - Any number of arguments to be supplied to the function to call
         */
        WidgetBase.prototype.Call = function (methodName) {
            if (this.deleted) {
                return;
            }
            if (this.exposedMethods[methodName]) {
                return this.exposedMethods[methodName].apply(this, Array.prototype.slice.call(arguments, 1));
            }
            else {
                jQueryModule.error('Method ' + methodName + ' does not exist on jQuery.' + this.constructor.pluginName);
            }
        };
        WidgetBase.prototype.SaveElementState = function () {
            if (this.deleted) {
                return;
            }
            //store things we will modify about the element, as to restore it later
            //this.originalElementState["var"] = this.targetElement.prop
        };
        WidgetBase.prototype.RestoreElementState = function () {
            if (this.deleted) {
                return;
            }
            //restore things we modified, from the old element state
            //this.originalElementState["var"]
        };
        /**
         * Checks whether a particular jQuery element has an instance of Greenify stored in a data attribute
         * @param {JQuery} element The element to check
         *
         * @return {boolean} Whether the passed in jQuery element has an instance of Greenify
         */
        WidgetBase.ElementHasInstance = function (element) {
            var thisObj = this;
            var dataInstance = Helper_1.Helper.GetDataIfPresent(element, thisObj.widgetDataName, thisObj);
            return (dataInstance !== null);
        };
        /**
         * Gets a factory to construct future instances of Greenify without having to specify options again.
         * Useful for making a "standardized" widget for consistent use.
         *
         * @param {Visuals.GreenifyOptions} [$options] The options to use for this factory
         *
         * @return {object} An object representing the factory. The method "GetInstance" can be used to create instances (provided you supply the jQuery element to target)
         */
        WidgetBase.GetFactory = function ($options) {
            var thisObj = this;
            var className = thisObj.pluginName;
            return {
                GetInstance: function ($target) {
                    if (!$target[className]) {
                        // plugin doesn't exist on object
                        var jq = thisObj.AttachToJQuery(jQueryModule);
                        $target = jq($target);
                    }
                    return $target[className]($options);
                }
            };
        };
        /**
         * A convenience method to create an instance of Greenify on a target jquery element
         *
         * @param {JQuery} $target The target element for Greenify
         * @param {Visuals.GreenifyOptions} [$options] The options to use for Greenify
         *
         * @return {(Visuals.Greenify | Visuals.Greenify[] | jQuery)} The result of instantiating Greenify. If one element is present in the jQuery element passed in, an instance of Greenify is returned. If multiple elements are present in the jQuery element, then an array (in order of the jQuery elements) of Greenify instances are returned. If "returnJQuery" is passed in as an option (and is true), then the original jQuery element is returned (for method chaining use)
         */
        WidgetBase.Create = function ($target, $options) {
            var thisObj = this;
            return thisObj.GetFactory($options).GetInstance($target);
        };
        /**
         * Attach our constructor function to an instance of jQuery
         *
         * @param {JQueryStatic} jq The instance of jQuery to attach our constructor function to
         * @param {string} subFieldName The subfield of the jQuery object to "encapsulate" the widget under
         *
         * @return {JQueryStatic} The instance of jQuery with our Greenify constructor added
         */
        WidgetBase.AttachToJQuery = function (jq, subFieldName) {
            if (subFieldName === void 0) { subFieldName = ""; }
            var hasSubField = (!TypeChecker_1.TypeChecker.isNull(subFieldName) && subFieldName !== "");
            var thisObj = this;
            var className = thisObj.pluginName;
            //no jQuery passed
            if (!jq) {
                return null;
            }
            Helper_1.Helper.AddJQueryNamespaceFunction(jq);
            if (hasSubField && jq.fn.hasOwnProperty(subFieldName) && jq.fn[subFieldName].hasOwnProperty(className)) {
                return jq;
            }
            else if (!hasSubField && jq.fn.hasOwnProperty(className)) {
                return jq;
            }
            var objToExtendWith = {};
            var widgetFactoryFunction = function (methodOrOptions) {
                var returnJQuery = ((typeof methodOrOptions !== 'undefined') && methodOrOptions.hasOwnProperty('returnJQuery') && methodOrOptions.returnJQuery);
                if (methodOrOptions && TypeChecker_1.TypeChecker.isString(methodOrOptions) && WidgetBase.ElementHasInstance(this)) {
                    //assume it's a method call using a string
                    //get instance
                    var instance = Helper_1.Helper.GetDataIfPresent(this, thisObj.widgetDataName, thisObj);
                    instance.Call.apply(instance, arguments);
                }
                else {
                    //if no options, or no instance on this element, assume we should initialize
                    var initForElement_1 = function (obj) {
                        var instance = null;
                        if (thisObj.ElementHasInstance(obj)) { //if element has instance, then just return that
                            instance = Helper_1.Helper.GetDataIfPresent(obj, thisObj.widgetDataName, thisObj);
                        }
                        else {
                            instance = new thisObj(obj, methodOrOptions);
                            obj.data(thisObj.widgetDataName, instance);
                        }
                        return instance;
                    };
                    var objectsInitialized_1 = [];
                    var jqEach = this.each(function () {
                        var eachElement = jq(this);
                        objectsInitialized_1.push(initForElement_1(eachElement));
                    });
                    return (returnJQuery ? jqEach : (objectsInitialized_1.length === 1 ? objectsInitialized_1[0] : objectsInitialized_1));
                }
            };
            if (hasSubField) {
                objToExtendWith[className] = widgetFactoryFunction;
                jQueryModule.namespace(subFieldName, objToExtendWith);
            }
            else {
                objToExtendWith[className] = widgetFactoryFunction;
                jq.fn.extend(objToExtendWith);
            }
            return jq;
        }; //attach to jquery method
        WidgetBase.RemoveFromJQuery = function (jq) {
            //no jQuery passed
            if (!jq) {
                return null;
            }
            if (!jq.fn.hasOwnProperty(this.constructor.pluginName)) {
                return jq;
            }
            delete jq.fn[this.constructor.pluginName];
            return jq;
        };
        /** Internal use, to track if certain assets (such as css) are loaded only once */
        WidgetBase.loadedOnce = false;
        WidgetBase.widgetDataName = "widget_base_instance";
        WidgetBase.pluginName = "WidgetBase";
        WidgetBase.baseDefaultOptions = {
            "loadCSS": true
        };
        return WidgetBase;
    }());
    exports.WidgetBase = WidgetBase;
});
//# sourceMappingURL=WidgetBase.js.map
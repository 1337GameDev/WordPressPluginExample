(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "jquery", "./Classes/Helper", "./Classes/TypeChecker"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <reference path="../../lib/@types/jquery/index.d.ts" />
    var jQueryModule = require("jquery");
    var Helper_1 = require("./Classes/Helper");
    var TypeChecker_1 = require("./Classes/TypeChecker");
    var Visuals;
    (function (Visuals) {
        /** Internal use, to track if certain assets (such as css) are loaded only once */
        var loadedOnce = false;
        function performSingleLoadOperations() {
            if (loadedOnce) {
                return;
            }
            //use require-css to include our plugin's custom css file
            require(['css!modules/Greenify/css/Greenify']);
            loadedOnce = true;
        }
        /** Class representing options that Greenify accepts. */
        var GreenifyOptions = /** @class */ (function () {
            /**
             * Create an options class.
             * @param color - The text color value.
             * @param backgroundColor - The background color value.
             * @param returnJQuery - Whether to return jQuery when invoking the jQuery constructor.
             * @param loadCSS - Whether to load the CSS for this plugin (once) when instantiating.
             */
            function GreenifyOptions(color, backgroundColor, returnJQuery, loadCSS) {
                if (color === void 0) { color = GreenifyOptions.getDefaults().color; }
                if (backgroundColor === void 0) { backgroundColor = GreenifyOptions.getDefaults().backgroundColor; }
                if (returnJQuery === void 0) { returnJQuery = GreenifyOptions.getDefaults().returnJQuery; }
                if (loadCSS === void 0) { loadCSS = GreenifyOptions.getDefaults().loadCSS; }
                this.color = color;
                this.backgroundColor = backgroundColor;
                this.returnJQuery = returnJQuery;
                this.loadCSS = loadCSS;
            }
            /** The default options */
            GreenifyOptions.getDefaults = function () {
                return new Visuals.GreenifyOptions('#00FF00', '#000000', false, true);
            };
            return GreenifyOptions;
        }());
        Visuals.GreenifyOptions = GreenifyOptions;
        /** Class for the Greenify jQuery plugin. */
        var Greenify = /** @class */ (function () {
            /**
             * Create a Greenify instance
             * @param {JQuery} element - The target element of Greenify
             * @param {Visuals.TabOptions} [options] - Options to be supplied to Greenify via {@link Visuals.TabOptions}
             */
            function Greenify(element, options) {
                /** A mechanism to signify that this plugin has been deleted -- to avoid use by stale references */
                this.deleted = false;
                /** A cache for data used to store parts of the unmodified target element for use when this widget is destroyed */
                this.originalElementState = {};
                /** A cache for methods that are accessible by the jQuery attached constructor, or the "Call" method. These methods are called via their string names */
                this.exposedMethods = null;
                //build the array of methods you want to expose
                this.exposedMethods = {
                    "Defaults": Visuals.GreenifyOptions.getDefaults,
                    "Destroy": this.Destroy,
                    "TestMethod": this.TestMethod
                };
                this.element = element;
                var defaults = Visuals.GreenifyOptions.getDefaults();
                //extend the defaults!
                options = jQueryModule.extend({}, defaults, options);
                this.options = options;
                if (this.options.loadCSS && loadedOnce) {
                    performSingleLoadOperations();
                }
                this.OnCreate();
            }
            /**
             * Call an exposed method {@link Visuals.Greenify.exposedMethods}
             * @param {string} methodName - The method name to call (as a string)
             * @param {any} [args] - Any number of arguments to be supplied to the function to call
             */
            Greenify.prototype.Call = function (methodName) {
                if (this.deleted) {
                    return;
                }
                if (this.exposedMethods[methodName]) {
                    return this.exposedMethods[methodName].apply(this, Array.prototype.slice.call(arguments, 1));
                }
                else {
                    jQueryModule.error('Method ' + methodName + ' does not exist on jQuery.' + Visuals.Greenify.pluginName);
                }
            };
            /**
             * A test instance method
             */
            Greenify.prototype.TestMethod = function (val) {
                if (this.deleted) {
                    return;
                }
                console.log("TestMethod called with value:" + val);
            };
            /**
             * This method is used internally of this plugin to attach it's own handlers
             */
            Greenify.prototype.AttachHandlers = function () {
                if (this.deleted) {
                    return;
                }
                var that = this;
                //this is deprecated and a MutationObserver should be used instead.
                this.element.on("DOMNodeRemoved", function () {
                    that.Destroy();
                });
            };
            /**
             * This method is used internally of this plugin to remove it's own handlers it attached via {@link Visuals.Greenify.AttachHandlers}
             */
            Greenify.prototype.RemoveHandlers = function () {
                if (this.deleted) {
                    return;
                }
                //this is deprecated and a MutationObserver should be used instead.
                this.element.off("DOMNodeRemoved");
            };
            /**
             * This method is used internally of this plugin to perform actions during it's instantiation
             */
            Greenify.prototype.OnCreate = function () {
                if (this.deleted) {
                    return;
                }
                this.saveElementState();
                this.element.addClass("greenify");
                this.element.css('color', this.options.color).css('background-color', this.options.backgroundColor);
                this.AttachHandlers();
            };
            /**
             * This method is used (and can be called publicly) to undo actions performed {@link Visuals.Greenify.OnCreate}
             */
            Greenify.prototype.Destroy = function () {
                if (this.deleted) {
                    return;
                }
                this.RemoveHandlers();
                this.restoreElementState();
                //remove the data instance from this element
                this.element.removeData(Visuals.Greenify.dataKey);
                for (var propName in this) {
                    if (this.hasOwnProperty(propName)) {
                        delete this[propName];
                    }
                }
                this.deleted = true;
            };
            Greenify.prototype.saveElementState = function () {
                if (this.deleted) {
                    return;
                }
                //store things we will modify about the element, as to restore it later
                this.originalElementState["color"] = this.element.css("color");
                this.originalElementState["background-color"] = this.element.css("background-color");
            };
            Greenify.prototype.restoreElementState = function () {
                if (this.deleted) {
                    return;
                }
                //restore things we modified, from the old element state
                this.element.css('color', this.originalElementState["color"]).css('background-color', this.originalElementState["background-color"]);
                this.element.removeClass("greenify");
            };
            /**
             * Checks whether a particular jQuery element has an instance of Greenify stored in a data attribute
             * @param {JQuery} element The element to check
             *
             * @return {boolean} Whether the passed in jQuery element has an instance of Greenify
             */
            Greenify.ElementHasInstance = function (element) {
                var dataInstance = Helper_1.Helper.GetDataIfPresent(element, Visuals.Greenify.dataKey, Visuals.Greenify);
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
            Greenify.GetFactory = function ($options) {
                return {
                    GetInstance: function ($target) {
                        if (!$target.Greenify) {
                            // plugin doesn't exist on object
                            var jq = Visuals.Greenify.AttachToJQuery(jQueryModule);
                            $target = jq($target);
                        }
                        return $target.Greenify($options);
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
            Greenify.Create = function ($target, $options) {
                return Visuals.Greenify.GetFactory($options).GetInstance($target);
            };
            /**
             * Attach our constructor function to an instance of jQuery
             *
             * @param {JQueryStatic} jq The instance of jQuery to attach our constructor function to
             *
             * @return {JQueryStatic} The instance of jQuery with our Greenify constructor added
             */
            Greenify.AttachToJQuery = function (jq) {
                //no jQuery passed
                if (!jq) {
                    return null;
                }
                if (jq.fn.hasOwnProperty("Greenify")) {
                    return jq;
                }
                jq.fn.extend({
                    Greenify: function (methodOrOptions) {
                        var returnJQuery = ((typeof methodOrOptions !== 'undefined') && methodOrOptions.hasOwnProperty('returnJQuery') && methodOrOptions.returnJQuery);
                        if (methodOrOptions && TypeChecker_1.TypeChecker.isString(methodOrOptions) && Visuals.Greenify.ElementHasInstance(this)) {
                            //assume it's a method call using a string
                            //get instance
                            var instance = Helper_1.Helper.GetDataIfPresent(this, Visuals.Greenify.dataKey, Visuals.Greenify);
                            instance.Call.apply(instance, arguments);
                        }
                        else {
                            //if no options, or no instance on this element, assume we should initialize
                            var initForElement_1 = function (obj) {
                                var instance = null;
                                if (Visuals.Greenify.ElementHasInstance(obj)) { //if element has instance, then just return that
                                    instance = Helper_1.Helper.GetDataIfPresent(obj, Visuals.Greenify.dataKey, Visuals.Greenify);
                                }
                                else {
                                    instance = new Visuals.Greenify(obj, methodOrOptions);
                                    obj.data(Visuals.Greenify.dataKey, instance);
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
                    }
                });
                return jq;
            }; //attach to jquery method
            Greenify.RemoveFromJQuery = function (jq) {
                //no jQuery passed
                if (!jq) {
                    return null;
                }
                if (!jq.fn.hasOwnProperty("Greenify")) {
                    return jq;
                }
                delete jq.fn["Greenify"];
                return jq;
            };
            /** The plugin name (used for runtime use of this plugin name (as minification can rename classes) */
            Greenify.pluginName = "Greenify";
            /** The key name used for the data attribute to store this plugin instance on the target element (to avoid initializing the plugin on the target multiple times) */
            Greenify.dataKey = "greenify";
            return Greenify;
        }()); //Greenify class
        Visuals.Greenify = Greenify;
    })(Visuals = exports.Visuals || (exports.Visuals = {}));
    //any implicit setups here
    Visuals.Greenify.AttachToJQuery(jQueryModule);
});
//# sourceMappingURL=Greenify.js.map
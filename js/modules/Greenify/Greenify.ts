/// <reference path="../../lib/@types/jquery/index.d.ts" />
import * as jQueryModule from 'jquery';
import {Helper, DynamicObject} from './Classes/Helper';
import {TypeChecker} from './Classes/TypeChecker';

export namespace Visuals {
    /** Internal use, to track if certain assets (such as css) are loaded only once */
    let loadedOnce:boolean = false;
    function performSingleLoadOperations() {
        if(loadedOnce) {
            return;
        }
        //use require-css to include our plugin's custom css file
        require(['css!modules/Greenify/css/Greenify']);
        loadedOnce = true;
    }

    export interface IGreenifyOptions {
        color?: string;
        backgroundColor?: string;
        returnJQuery?: boolean;
        loadCSS?: boolean;
    }

    /** Class representing options that Greenify accepts. */
    export class GreenifyOptions implements IGreenifyOptions {
        /** The default options */
        public static getDefaults():GreenifyOptions {
            return new Visuals.GreenifyOptions(
                '#00FF00',
                '#000000',
                false,
                true
            );
        }

        /** The text color - using a css value */
        color?: string;
        /** The background color - using a css value */
        backgroundColor?: string;
        /** Whether to return jQuery when instantiating Greenify via {@link Visuals.Greenify.Create} or via the Greenify jQuery constructor method.*/
        returnJQuery?: boolean;
        /** Whether to include CSS loading for this widget (can be disabled for testing)*/
        loadCSS?: boolean;
        /**
         * Create an options class.
         * @param color - The text color value.
         * @param backgroundColor - The background color value.
         * @param returnJQuery - Whether to return jQuery when invoking the jQuery constructor.
         * @param loadCSS - Whether to load the CSS for this plugin (once) when instantiating.
         */
        constructor(color: string = GreenifyOptions.getDefaults().color, backgroundColor: string = GreenifyOptions.getDefaults().backgroundColor, returnJQuery:boolean = GreenifyOptions.getDefaults().returnJQuery, loadCSS:boolean = GreenifyOptions.getDefaults().loadCSS) {
            this.color = color;
            this.backgroundColor = backgroundColor;
            this.returnJQuery = returnJQuery;
            this.loadCSS = loadCSS;
        }
    }

    /** Class for the Greenify jQuery plugin. */
    export class Greenify {
        /** The target element of Greenify */
        element: JQuery;
        /** Options supplied to Greenify */
        options: Visuals.GreenifyOptions;

        /** The plugin name (used for runtime use of this plugin name (as minification can rename classes) */
        static pluginName = "Greenify";
        /** The key name used for the data attribute to store this plugin instance on the target element (to avoid initializing the plugin on the target multiple times) */
        private static dataKey = "greenify";

        /** A mechanism to signify that this plugin has been deleted -- to avoid use by stale references */
        private deleted = false;

        /** A cache for data used to store parts of the unmodified target element for use when this widget is destroyed */
        private originalElementState: DynamicObject = {};
        /** A cache for methods that are accessible by the jQuery attached constructor, or the "Call" method. These methods are called via their string names */
        private readonly exposedMethods:DynamicObject = null;

        /**
         * Create a Greenify instance
         * @param {JQuery} element - The target element of Greenify
         * @param {Visuals.TabOptions} [options] - Options to be supplied to Greenify via {@link Visuals.TabOptions}
         */
        constructor(element: JQuery, options?: Visuals.GreenifyOptions) {
            //build the array of methods you want to expose
            this.exposedMethods = {
                "Defaults": Visuals.GreenifyOptions.getDefaults,
                "Destroy": this.Destroy,
                "TestMethod": this.TestMethod
            };

            this.element = element;

            let defaults: Visuals.GreenifyOptions = Visuals.GreenifyOptions.getDefaults();
            //extend the defaults!
            options = jQueryModule.extend({}, defaults, options);

            this.options = options;

            if(this.options.loadCSS && loadedOnce) {
                performSingleLoadOperations();
            }

            this.OnCreate();
        }

        /**
         * Call an exposed method {@link Visuals.Greenify.exposedMethods}
         * @param {string} methodName - The method name to call (as a string)
         * @param {any} [args] - Any number of arguments to be supplied to the function to call
         */
        public Call(methodName:string) {
            if(this.deleted) {
                return;
            }

            if(this.exposedMethods[methodName]) {
                return this.exposedMethods[methodName].apply(this, Array.prototype.slice.call(arguments, 1));
            } else {
                jQueryModule.error('Method '+methodName+' does not exist on jQuery.'+Visuals.Greenify.pluginName);
            }
        }

        /**
         * A test instance method
         */
        TestMethod(val?:string) {
            if(this.deleted) {
                return;
            }

            console.log("TestMethod called with value:"+val);
        }

        /**
         * This method is used internally of this plugin to attach it's own handlers
         */
        private AttachHandlers() {
            if(this.deleted) {
                return;
            }

            let that = this;

            //this is deprecated and a MutationObserver should be used instead.
            this.element.on("DOMNodeRemoved", function(){
                that.Destroy();
            });
        }

        /**
         * This method is used internally of this plugin to remove it's own handlers it attached via {@link Visuals.Greenify.AttachHandlers}
         */
        private RemoveHandlers() {
            if(this.deleted) {
                return;
            }

            //this is deprecated and a MutationObserver should be used instead.
            this.element.off("DOMNodeRemoved");
        }

        /**
         * This method is used internally of this plugin to perform actions during it's instantiation
         */
        private OnCreate() {
            if(this.deleted) {
                return;
            }

            this.saveElementState();

            this.element.addClass("greenify");
            this.element.css('color', this.options.color).css('background-color', this.options.backgroundColor);

            this.AttachHandlers();
        }

        /**
         * This method is used (and can be called publicly) to undo actions performed {@link Visuals.Greenify.OnCreate}
         */
        public Destroy() {
            if(this.deleted) {
                return;
            }

            this.RemoveHandlers();
            this.restoreElementState();

            //remove the data instance from this element
            this.element.removeData(Visuals.Greenify.dataKey);

            for (let propName in this) {
                if(this.hasOwnProperty(propName)) {
                    delete this[propName];
                }
            }

            this.deleted = true;
        }

        private saveElementState() {
            if(this.deleted) {
                return;
            }

            //store things we will modify about the element, as to restore it later
            this.originalElementState["color"] = this.element.css("color");
            this.originalElementState["background-color"] = this.element.css("background-color");
        }

        private restoreElementState() {
            if(this.deleted) {
                return;
            }

            //restore things we modified, from the old element state
            this.element.css('color', this.originalElementState["color"]).css('background-color', this.originalElementState["background-color"]);
            this.element.removeClass("greenify");
        }

        /**
         * Checks whether a particular jQuery element has an instance of Greenify stored in a data attribute
         * @param {JQuery} element The element to check
         *
         * @return {boolean} Whether the passed in jQuery element has an instance of Greenify
         */
        static ElementHasInstance(element: JQuery):boolean {
            let dataInstance = Helper.GetDataIfPresent(element, Visuals.Greenify.dataKey, Visuals.Greenify);
            return (dataInstance !== null);
        }

        /**
         * Gets a factory to construct future instances of Greenify without having to specify options again.
         * Useful for making a "standardized" widget for consistent use.
         *
         * @param {Visuals.GreenifyOptions} [$options] The options to use for this factory
         *
         * @return {object} An object representing the factory. The method "GetInstance" can be used to create instances (provided you supply the jQuery element to target)
         */
        static GetFactory($options?:Visuals.GreenifyOptions) {
            return {
                GetInstance: function($target){
                    if(!$target.Greenify) {
                        // plugin doesn't exist on object
                        let jq:JQueryStatic = Visuals.Greenify.AttachToJQuery(jQueryModule);
                        $target = jq($target);
                    }
                    return $target.Greenify($options);
                }
            };
        }

        /**
         * A convenience method to create an instance of Greenify on a target jquery element
         *
         * @param {JQuery} $target The target element for Greenify
         * @param {Visuals.GreenifyOptions} [$options] The options to use for Greenify
         *
         * @return {(Visuals.Greenify | Visuals.Greenify[] | jQuery)} The result of instantiating Greenify. If one element is present in the jQuery element passed in, an instance of Greenify is returned. If multiple elements are present in the jQuery element, then an array (in order of the jQuery elements) of Greenify instances are returned. If "returnJQuery" is passed in as an option (and is true), then the original jQuery element is returned (for method chaining use)
         */
        static Create($target:JQuery, $options?: Visuals.GreenifyOptions): Visuals.Greenify | Visuals.Greenify[] | JQuery {
            return Visuals.Greenify.GetFactory($options).GetInstance($target);
        }

        /**
         * Attach our constructor function to an instance of jQuery
         *
         * @param {JQueryStatic} jq The instance of jQuery to attach our constructor function to
         *
         * @return {JQueryStatic} The instance of jQuery with our Greenify constructor added
         */
        static AttachToJQuery(jq: JQueryStatic):JQueryStatic {
            //no jQuery passed
            if (!jq) {
                return null;
            }

            if(jq.fn.hasOwnProperty("Greenify") ) {
                return jq;
            }

            jq.fn.extend({
                Greenify: function(methodOrOptions):JQuery | Visuals.Greenify | Visuals.Greenify[] {
                    let returnJQuery:boolean = ((typeof methodOrOptions !== 'undefined') && methodOrOptions.hasOwnProperty('returnJQuery') && methodOrOptions.returnJQuery);

                    if(methodOrOptions && TypeChecker.isString(methodOrOptions) && Visuals.Greenify.ElementHasInstance(this)) {
                        //assume it's a method call using a string
                        //get instance
                        let instance:Greenify = Helper.GetDataIfPresent(this, Visuals.Greenify.dataKey, Visuals.Greenify);
                        instance.Call.apply(instance, arguments);
                    } else {
                        //if no options, or no instance on this element, assume we should initialize
                        let initForElement = function(obj:any) : Visuals.Greenify {
                            let instance = null;

                            if(Visuals.Greenify.ElementHasInstance(obj) ) {//if element has instance, then just return that
                                instance = Helper.GetDataIfPresent(obj, Visuals.Greenify.dataKey, Visuals.Greenify);
                            } else {
                                instance = new Visuals.Greenify(obj, methodOrOptions);
                                obj.data(Visuals.Greenify.dataKey, instance);
                            }

                            return instance;
                        };

                        let objectsInitialized:Visuals.Greenify[] = [];
                        let jqEach = this.each(function() {
                            let eachElement = jq(this);
                            objectsInitialized.push(initForElement(eachElement) );
                        });

                        return (returnJQuery ? jqEach : (objectsInitialized.length === 1 ? objectsInitialized[0] : objectsInitialized) );
                    }
                }
            });

            return jq;
        }//attach to jquery method

        static RemoveFromJQuery(jq: JQueryStatic):JQueryStatic {
            //no jQuery passed
            if (!jq) {
                return null;
            }

            if(!jq.fn.hasOwnProperty("Greenify") ) {
                return jq;
            }

            delete jq.fn["Greenify"];

            return jq;
        }

    }//Greenify class
}

namespace global {
    interface JQuery {
        Greenify(options?: Visuals.IGreenifyOptions): Visuals.Greenify | Visuals.Greenify[] | JQuery;
    }

    interface JQueryStatic {
        Greenify(options?: Visuals.IGreenifyOptions): Visuals.Greenify | Visuals.Greenify[] | JQuery;
    }
}

//any implicit setups here
Visuals.Greenify.AttachToJQuery(jQueryModule);
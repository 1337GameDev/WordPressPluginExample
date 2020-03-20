import {Helper} from "./Helper";
import {DynamicObject} from "./DynamicObject";
import * as jQueryModule from 'jquery';
import {TypeChecker} from "./TypeChecker";

/*
 * The Widget base class. Should be used whenever making a new widget
 */
export class WidgetBase {
    /** Internal use, to track if certain assets (such as css) are loaded only once */
    protected static loadedOnce:boolean = false;
    public static performSingleLoadOperations() {
        if(WidgetBase.loadedOnce) {
            return;
        }

        let thisObj = (<typeof WidgetBase>this);

        if(thisObj.baseDefaultOptions["loadCSS"]) {
            //use require-css to include our plugin's custom css file
            require(['css!modules/Common_Widgets/css/Common_Widgets']);
        }

        WidgetBase.loadedOnce = true;
    }

    protected settings:DynamicObject = null;
    protected widgetType:string;
    protected targetElement:JQuery = null;//the element this widget was called on
    public GetTargetElement():JQuery {
        return this.targetElement;
    }

    protected widgetRootContainer:JQuery = null;
    protected widgetRoot:JQuery = null;

    protected static readonly widgetDataName:string = "widget_base_instance";
    protected static readonly pluginName:string = "WidgetBase";

    protected static baseDefaultOptions:DynamicObject = {
        "loadCSS": true
    };

    /** A mechanism to signify that this plugin has been deleted -- to avoid use by stale references */
    protected deleted = false;

    /** A cache for data used to store parts of the unmodified target element for use when this widget is destroyed */
    protected originalElementState: DynamicObject = {};
    /** A cache for methods that are accessible by the jQuery attached constructor, or the "Call" method. These methods are called via their string names */
    protected readonly exposedMethods:DynamicObject = null;

    constructor(target:JQuery, settings:DynamicObject, otherDefaults:DynamicObject = []){
        if (target.length === 0) {
            console.warn("The target for this WidgetBase was empty.");
            return;
        }

        //build the array of methods you want to expose
        this.exposedMethods = {
            "Destroy": this.Destroy,
            "DisableTooltips": this.DisableTooltips,
            "DestroyTooltips":this.DestroyTooltips,
            "EnableTooltips":this.EnableTooltips,
            "SetShowTooltips":this.SetShowTooltips,
            "GetTargetElement":this.GetTargetElement
        };

        //extend the defaults!
        this.settings = jQueryModule.extend({}, WidgetBase.baseDefaultOptions, otherDefaults, settings);

        this.widgetType = this.constructor.name;
        Helper.RegisterWidget(this);
        target.addClass("hasWidget");
        this.targetElement = target;
        this.widgetRootContainer = target.parent();
    }

    /**
     * This method is used internally of this plugin to attach it's own handlers
     */
    protected AttachHandlers() {
        if(this.deleted) {
            return;
        }

        let that = this;

        //this is deprecated and a MutationObserver should be used instead.
        this.targetElement.on("DOMNodeRemoved", function(){
            that.Destroy();
        });
    }

    /**
     * This method is used internally of this plugin to remove it's own handlers it attached via {@link WidgetBase.AttachHandlers}
     */
    protected RemoveHandlers() {
        if(this.deleted) {
            return;
        }

        //this is deprecated and a MutationObserver should be used instead.
        this.targetElement.off("DOMNodeRemoved");
    }

    /**
     * This method is used internally of this plugin to perform actions during its instantiation
     */
    protected OnCreate() {
        if(this.deleted) {
            return;
        }
    }

    /**
     * This method is used (and can be called publicly) to undo actions performed when the widget is created
     */
    public Destroy() {
        if(this.deleted) {
            return;
        }

        this.RemoveHandlers();
        this.DestroyTooltips();
        let classConstructor = (<typeof WidgetBase>this.constructor);

        //remove the data instance from this element
        this.targetElement.removeData(classConstructor.widgetDataName);

        this.RestoreElementState();



        for (let propName in this) {
            if(this.hasOwnProperty(propName)) {
                delete this[propName];
            }
        }

        Helper.UnregisterWidget(this);
        this.deleted = true;
    }

    //override in children
    public DisableTooltips():boolean {
        console.log("DisableTooltips: true");
        return true;
    }

    //override in children
    public DestroyTooltips():boolean {
        console.log("DestroyTooltips: true");
        return true;
    }

    //override in children
    public EnableTooltips():boolean {
        console.log("EnableTooltips: true");
        return true;
    }

    //the method to call to show/hide tooltips based on an input boolean
    public SetShowTooltips(showTooltips:boolean) {
        if(this.deleted) {
            return;
        }

        this.settings.showTooltips = showTooltips;
        if (showTooltips) {
            this.EnableTooltips();
        } else {
            this.DisableTooltips();
        }
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
            jQueryModule.error('Method '+methodName+' does not exist on jQuery.'+(<typeof WidgetBase>this.constructor).pluginName);
        }
    }

    protected SaveElementState() {
        if(this.deleted) {
            return;
        }

        //store things we will modify about the element, as to restore it later
        //this.originalElementState["var"] = this.targetElement.prop
    }

    protected RestoreElementState() {
        if(this.deleted) {
            return;
        }

        //restore things we modified, from the old element state
        //this.originalElementState["var"]
    }

    /**
     * Checks whether a particular jQuery element has an instance of Greenify stored in a data attribute
     * @param {JQuery} element The element to check
     *
     * @return {boolean} Whether the passed in jQuery element has an instance of Greenify
     */
    static ElementHasInstance(element: JQuery):boolean {
        let thisObj = (<typeof WidgetBase>this);

        let dataInstance = Helper.GetDataIfPresent(element, thisObj.widgetDataName, thisObj);
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
    static GetFactory($options?:DynamicObject) {
        let thisObj = (<typeof WidgetBase>this);
        let className = thisObj.pluginName;

        return {
            GetInstance: function($target){
                if(!$target[className]) {
                    // plugin doesn't exist on object
                    let jq:JQueryStatic = thisObj.AttachToJQuery(jQueryModule);
                    $target = jq($target);
                }
                return $target[className]($options);
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
    static Create($target:JQuery, $options?: DynamicObject): WidgetBase | WidgetBase[] | JQuery {
        let thisObj = (<typeof WidgetBase>this);

        return thisObj.GetFactory($options).GetInstance($target);
    }

    /**
     * Attach our constructor function to an instance of jQuery
     *
     * @param {JQueryStatic} jq The instance of jQuery to attach our constructor function to
     * @param {string} subFieldName The subfield of the jQuery object to "encapsulate" the widget under
     *
     * @return {JQueryStatic} The instance of jQuery with our Greenify constructor added
     */
    static AttachToJQuery(jq: JQueryStatic, subFieldName:string = ""):JQueryStatic {
        let hasSubField = (!TypeChecker.isNull(subFieldName) && subFieldName !== "");
        let thisObj = (<typeof WidgetBase>this);
        let className = thisObj.pluginName;

        //no jQuery passed
        if (!jq) {
            return null;
        }

        Helper.AddJQueryNamespaceFunction(jq);

        if(hasSubField && jq.fn.hasOwnProperty(subFieldName) && jq.fn[subFieldName].hasOwnProperty(className)) {
            return jq;
        } else if(!hasSubField && jq.fn.hasOwnProperty(className) ) {
            return jq;
        }

        let objToExtendWith = {};

        let widgetFactoryFunction = function(methodOrOptions):JQuery | WidgetBase | WidgetBase[] {
            let returnJQuery:boolean = ((typeof methodOrOptions !== 'undefined') && methodOrOptions.hasOwnProperty('returnJQuery') && methodOrOptions.returnJQuery);

            if(methodOrOptions && TypeChecker.isString(methodOrOptions) && WidgetBase.ElementHasInstance(this)) {
                //assume it's a method call using a string
                //get instance
                let instance:WidgetBase = Helper.GetDataIfPresent(this, thisObj.widgetDataName, thisObj);
                instance.Call.apply(instance, arguments);
            } else {
                //if no options, or no instance on this element, assume we should initialize
                let initForElement = function(obj:any) : WidgetBase {
                    let instance = null;

                    if(thisObj.ElementHasInstance(obj) ) {//if element has instance, then just return that
                        instance = Helper.GetDataIfPresent(obj, thisObj.widgetDataName, thisObj);
                    } else {
                        instance = new thisObj(obj, methodOrOptions);
                        obj.data(thisObj.widgetDataName, instance);
                    }

                    return instance;
                };

                let objectsInitialized:WidgetBase[] = [];
                let jqEach = this.each(function() {
                    let eachElement = jq(this);
                    objectsInitialized.push(initForElement(eachElement) );
                });

                return (returnJQuery ? jqEach : (objectsInitialized.length === 1 ? objectsInitialized[0] : objectsInitialized) );
            }
        };



        if(hasSubField) {
            objToExtendWith[className] = widgetFactoryFunction;
            jQueryModule.namespace(subFieldName, objToExtendWith);
        } else {
            objToExtendWith[className] = widgetFactoryFunction;
            jq.fn.extend(objToExtendWith);
        }

        return jq;
    }//attach to jquery method

    static RemoveFromJQuery(jq: JQueryStatic):JQueryStatic {
        //no jQuery passed
        if (!jq) {
            return null;
        }

        if(!jq.fn.hasOwnProperty((<typeof WidgetBase>this.constructor).pluginName) ) {
            return jq;
        }

        delete jq.fn[(<typeof WidgetBase>this.constructor).pluginName];

        return jq;
    }
}
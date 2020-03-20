/// <reference path="../../lib/@types/jquery/index.d.ts" />
import * as jQueryModule from 'jquery';
import {Helper, DynamicObject} from './Classes/Helper';
import {TypeChecker} from './Classes/TypeChecker';

export namespace Navigation {
    /** Internal use, to track if certain assets (such as css) are loaded only once */
    let loadedOnce:boolean = false;
    function performSingleLoadOperations() {
        if(loadedOnce) {
            return;
        }

        //use require-css to include our plugin's custom css file
        require(['css!modules/Tabs/css/Tabs']);
        loadedOnce = true;
    }

    export interface ITabOptions {
        returnJQuery?: boolean;
        loadCSS?:boolean;
    }

    export class TabOptions implements ITabOptions {
        public static getDefaults(){
            return new Navigation.TabOptions(
                false,
                true
            );
        }

        /** Whether to return jQuery when instantiating Tabs via {@link Navigation.Tabs.Create} or via the Tabs jQuery constructor method.*/
        returnJQuery?: boolean;
        /** Whether to include CSS loading for this widget (can be disabled for testing)*/
        loadCSS?: boolean;

        constructor(returnJQuery:boolean = TabOptions.getDefaults().returnJQuery, loadCSS:boolean = TabOptions.getDefaults().loadCSS) {
            this.returnJQuery = returnJQuery;
            this.loadCSS = loadCSS;
        }
    }

    export class Tabs {
        // Fields
        element: JQuery;
        options: Navigation.TabOptions;

        static pluginName = "Tabs";
        private static dataKey = "tabs";
        private deleted = false;

        private originalElementState: DynamicObject = {};
        private readonly exposedMethods:DynamicObject = null;

        constructor(element: JQuery, options?: Navigation.TabOptions) {
            if(!this.ValidateTarget(element)) {
                throw new Error("The target of the \"Tab\" jQuery widget is invalid.");
            }

            //build the array of methods you want to expose
            this.exposedMethods = {
                "Defaults": TabOptions.getDefaults,
                "Destroy": this.Destroy,
                "SelectTab": this.selectTab,
                "CurrentTab": this.getCurrentTab,
                "GetTab": this.getTabByName,
                "GetTabContentContainer": this.getTabContentContainerByName,
                "UnselectAllTabs": this.unselectAllTabs,
                "UnselectAllTabContentContainers": this.unselectAllTabContent

            };

            this.element = element;

            //defaults.Tabs
            let defaults: Navigation.TabOptions = TabOptions.getDefaults();
            //extend the defaults!
            options = jQueryModule.extend({}, defaults, options);

            this.options = options;
            if(this.options.loadCSS && loadedOnce) {
                performSingleLoadOperations();
            }

            this.OnCreate();

            //select default
            //handle the case if there are no tabs defined in HTML
            if(this.element.find("a.nav-tab").length) {
                let defaultTabElement = this.element.find("a.nav-tab.default");
                if (!defaultTabElement.length) {
                    defaultTabElement = this.element.find("a.nav-tab:first-child");
                }


                let defaultTabName: string = defaultTabElement.data("tabname");
                this.selectTab(defaultTabName);
            }
        }

        public Call(methodName:string) {
            if(this.deleted) {
                return;
            }

            if (this.exposedMethods[methodName]) {
                return this.exposedMethods[methodName].apply(this, Array.prototype.slice.call(arguments, 1));
            } else {
                jQueryModule.error('Method '+methodName+' does not exist on jQuery.'+Navigation.Tabs.pluginName);
            }
        }

        private ValidateTarget($target):boolean {
            if(this.deleted) {
                return;
            }

            return $target.hasClass("navtabs");
        }

        private AttachHandlers() {
            if(this.deleted) {
                return;
            }

            let that = this;

            //this is deprecated and a MutationObserver should be used instead.
            this.element.on("DOMNodeRemoved", function(){
                //that.Destroy();
            });

            this.element.on("click",".nav-tab-wrapper > .nav-tab",function(){
                let $this = jQueryModule(this);
                let clickedTabName = $this.data("tabname");
                that.selectTab(clickedTabName);
            });
        }

        public selectTab(tab:string) {
            if(this.deleted) {
                return;
            }

            //remove selected class from all tabs
            this.unselectAllTabs();
            //remove selected class from all tab content
            this.unselectAllTabContent();

            //get current tab
            let newSelectedTab = this.getTabByName(tab);
            newSelectedTab.addClass("nav-tab-active");

            let newSelectedTabContent = this.getTabContentContainerByName(tab);
            newSelectedTabContent.addClass("selected");
        }

        public getCurrentTab():JQuery {
            if(this.deleted) {
                return;
            }

            return this.element.find(".nav-tab-wrapper > .nav-tab.selected");
        }

        public getTabByName(name:string):JQuery {
            if(this.deleted) {
                return;
            }

            return this.element.find(".nav-tab-wrapper > .nav-tab[data-tabname='"+name+"']");
        }
        public getTabContentContainerByName(name:string):JQuery {
            if(this.deleted) {
                return;
            }

            return this.element.find(".navtab-content-container > .navtab-content[data-tabname='"+name+"']");
        }

        public unselectAllTabs() {
            if(this.deleted) {
                return;
            }

            this.element.find(".nav-tab-wrapper > .nav-tab").removeClass("nav-tab-active");
        }

        public unselectAllTabContent() {
            if(this.deleted) {
                return;
            }

            this.element.find(".navtab-content-container > .navtab-content").removeClass("selected");
        }

        private RemoveHandlers() {
            if(this.deleted) {
                return;
            }

            //this is deprecated and a MutationObserver should be used instead.
            this.element.off("DOMNodeRemoved");
        }

        private OnCreate() {
            if(this.deleted) {
                return;
            }

            this.saveElementState();
            this.AttachHandlers();

        }

        public Destroy() {
            if(this.deleted) {
                return;
            }

            this.RemoveHandlers();
            this.restoreElementState();

            this.element.removeData(Navigation.Tabs.dataKey);

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

        }

        private restoreElementState() {
            if(this.deleted) {
                return;
            }

            //restore things we modified, from the old element state

        }

        static ElementHasInstance(element: JQuery):boolean {
            let dataInstance = Helper.GetDataIfPresent(element, Navigation.Tabs.dataKey, Navigation.Tabs);
            return (dataInstance !== null);
        }

        static GetFactory($options?:Navigation.TabOptions) {
            return {
                GetInstance: function($target){
                    if(!$target.Tabs) {
                        // plugin doesn't exist on object
                        let jq:JQueryStatic = Navigation.Tabs.AttachToJQuery(jQueryModule);
                        $target = jq($target);
                    }
                    return $target.Tabs($options);
                }
            };
        }

        static Create($target:JQuery, $options?: Navigation.TabOptions): Navigation.Tabs | Navigation.Tabs[] | JQuery {
            return Navigation.Tabs.GetFactory($options).GetInstance($target);
        }

        static AttachToJQuery(jq: JQueryStatic):JQueryStatic {
            //no jQuery passed
            if (!jq) {
                return null;
            }

            jq.fn.extend({
                Tabs: function(methodOrOptions):JQuery | Navigation.Tabs | Navigation.Tabs[] {
                    let returnJQuery:boolean = ((typeof methodOrOptions !== 'undefined') && methodOrOptions.hasOwnProperty('returnJQuery') && methodOrOptions.returnJQuery);

                    if(methodOrOptions && TypeChecker.isString(methodOrOptions) && Navigation.Tabs.ElementHasInstance(this)) {
                        //assume it's a method call using a string
                        //get instance
                        let instance:Tabs = Helper.GetDataIfPresent(this, Navigation.Tabs.dataKey, Navigation.Tabs);
                        instance.Call.apply(instance, arguments);
                    } else {
                        //if no options, or no instance on this element, assume we should initialize
                        let initForElement = function(obj:any) : Navigation.Tabs {
                            let instance = null;

                            if(Navigation.Tabs.ElementHasInstance(obj) ) {//if element has instance, then just return that
                                instance = Helper.GetDataIfPresent(obj, Navigation.Tabs.dataKey, Navigation.Tabs);
                            } else {
                                instance = new Navigation.Tabs(obj, methodOrOptions);
                                obj.data(Navigation.Tabs.dataKey, instance);
                            }

                            return instance;
                        };

                        let objectsInitialized:Navigation.Tabs[] = [];
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

            if(!jq.fn.hasOwnProperty("Tabs") ) {
                return jq;
            }

            delete jq.fn["Tabs"];

            return jq;
        }

    }//Tabs class
}

namespace global {
    interface JQuery {
        Tabs(options?: Navigation.ITabOptions): Navigation.Tabs | Navigation.Tabs[] | JQuery;
    }

    interface JQueryStatic {
        Tabs(options?: Navigation.ITabOptions): Navigation.Tabs | Navigation.Tabs[] | JQuery;
    }
}

Navigation.Tabs.AttachToJQuery(jQueryModule);
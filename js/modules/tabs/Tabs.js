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
    var Navigation;
    (function (Navigation) {
        /** Internal use, to track if certain assets (such as css) are loaded only once */
        var loadedOnce = false;
        function performSingleLoadOperations() {
            if (loadedOnce) {
                return;
            }
            //use require-css to include our plugin's custom css file
            require(['css!modules/Tabs/css/Tabs']);
            loadedOnce = true;
        }
        var TabOptions = /** @class */ (function () {
            function TabOptions(returnJQuery, loadCSS) {
                if (returnJQuery === void 0) { returnJQuery = TabOptions.getDefaults().returnJQuery; }
                if (loadCSS === void 0) { loadCSS = TabOptions.getDefaults().loadCSS; }
                this.returnJQuery = returnJQuery;
                this.loadCSS = loadCSS;
            }
            TabOptions.getDefaults = function () {
                return new Navigation.TabOptions(false, true);
            };
            return TabOptions;
        }());
        Navigation.TabOptions = TabOptions;
        var Tabs = /** @class */ (function () {
            function Tabs(element, options) {
                this.deleted = false;
                this.originalElementState = {};
                this.exposedMethods = null;
                if (!this.ValidateTarget(element)) {
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
                var defaults = TabOptions.getDefaults();
                //extend the defaults!
                options = jQueryModule.extend({}, defaults, options);
                this.options = options;
                if (this.options.loadCSS && loadedOnce) {
                    performSingleLoadOperations();
                }
                this.OnCreate();
                //select default
                //handle the case if there are no tabs defined in HTML
                if (this.element.find("a.nav-tab").length) {
                    var defaultTabElement = this.element.find("a.nav-tab.default");
                    if (!defaultTabElement.length) {
                        defaultTabElement = this.element.find("a.nav-tab:first-child");
                    }
                    var defaultTabName = defaultTabElement.data("tabname");
                    this.selectTab(defaultTabName);
                }
            }
            Tabs.prototype.Call = function (methodName) {
                if (this.deleted) {
                    return;
                }
                if (this.exposedMethods[methodName]) {
                    return this.exposedMethods[methodName].apply(this, Array.prototype.slice.call(arguments, 1));
                }
                else {
                    jQueryModule.error('Method ' + methodName + ' does not exist on jQuery.' + Navigation.Tabs.pluginName);
                }
            };
            Tabs.prototype.ValidateTarget = function ($target) {
                if (this.deleted) {
                    return;
                }
                return $target.hasClass("navtabs");
            };
            Tabs.prototype.AttachHandlers = function () {
                if (this.deleted) {
                    return;
                }
                var that = this;
                //this is deprecated and a MutationObserver should be used instead.
                this.element.on("DOMNodeRemoved", function () {
                    //that.Destroy();
                });
                this.element.on("click", ".nav-tab-wrapper > .nav-tab", function () {
                    var $this = jQueryModule(this);
                    var clickedTabName = $this.data("tabname");
                    that.selectTab(clickedTabName);
                });
            };
            Tabs.prototype.selectTab = function (tab) {
                if (this.deleted) {
                    return;
                }
                //remove selected class from all tabs
                this.unselectAllTabs();
                //remove selected class from all tab content
                this.unselectAllTabContent();
                //get current tab
                var newSelectedTab = this.getTabByName(tab);
                newSelectedTab.addClass("nav-tab-active");
                var newSelectedTabContent = this.getTabContentContainerByName(tab);
                newSelectedTabContent.addClass("selected");
            };
            Tabs.prototype.getCurrentTab = function () {
                if (this.deleted) {
                    return;
                }
                return this.element.find(".nav-tab-wrapper > .nav-tab.selected");
            };
            Tabs.prototype.getTabByName = function (name) {
                if (this.deleted) {
                    return;
                }
                return this.element.find(".nav-tab-wrapper > .nav-tab[data-tabname='" + name + "']");
            };
            Tabs.prototype.getTabContentContainerByName = function (name) {
                if (this.deleted) {
                    return;
                }
                return this.element.find(".navtab-content-container > .navtab-content[data-tabname='" + name + "']");
            };
            Tabs.prototype.unselectAllTabs = function () {
                if (this.deleted) {
                    return;
                }
                this.element.find(".nav-tab-wrapper > .nav-tab").removeClass("nav-tab-active");
            };
            Tabs.prototype.unselectAllTabContent = function () {
                if (this.deleted) {
                    return;
                }
                this.element.find(".navtab-content-container > .navtab-content").removeClass("selected");
            };
            Tabs.prototype.RemoveHandlers = function () {
                if (this.deleted) {
                    return;
                }
                //this is deprecated and a MutationObserver should be used instead.
                this.element.off("DOMNodeRemoved");
            };
            Tabs.prototype.OnCreate = function () {
                if (this.deleted) {
                    return;
                }
                this.saveElementState();
                this.AttachHandlers();
            };
            Tabs.prototype.Destroy = function () {
                if (this.deleted) {
                    return;
                }
                this.RemoveHandlers();
                this.restoreElementState();
                this.element.removeData(Navigation.Tabs.dataKey);
                for (var propName in this) {
                    if (this.hasOwnProperty(propName)) {
                        delete this[propName];
                    }
                }
                this.deleted = true;
            };
            Tabs.prototype.saveElementState = function () {
                if (this.deleted) {
                    return;
                }
                //store things we will modify about the element, as to restore it later
            };
            Tabs.prototype.restoreElementState = function () {
                if (this.deleted) {
                    return;
                }
                //restore things we modified, from the old element state
            };
            Tabs.ElementHasInstance = function (element) {
                var dataInstance = Helper_1.Helper.GetDataIfPresent(element, Navigation.Tabs.dataKey, Navigation.Tabs);
                return (dataInstance !== null);
            };
            Tabs.GetFactory = function ($options) {
                return {
                    GetInstance: function ($target) {
                        if (!$target.Tabs) {
                            // plugin doesn't exist on object
                            var jq = Navigation.Tabs.AttachToJQuery(jQueryModule);
                            $target = jq($target);
                        }
                        return $target.Tabs($options);
                    }
                };
            };
            Tabs.Create = function ($target, $options) {
                return Navigation.Tabs.GetFactory($options).GetInstance($target);
            };
            Tabs.AttachToJQuery = function (jq) {
                //no jQuery passed
                if (!jq) {
                    return null;
                }
                jq.fn.extend({
                    Tabs: function (methodOrOptions) {
                        var returnJQuery = ((typeof methodOrOptions !== 'undefined') && methodOrOptions.hasOwnProperty('returnJQuery') && methodOrOptions.returnJQuery);
                        if (methodOrOptions && TypeChecker_1.TypeChecker.isString(methodOrOptions) && Navigation.Tabs.ElementHasInstance(this)) {
                            //assume it's a method call using a string
                            //get instance
                            var instance = Helper_1.Helper.GetDataIfPresent(this, Navigation.Tabs.dataKey, Navigation.Tabs);
                            instance.Call.apply(instance, arguments);
                        }
                        else {
                            //if no options, or no instance on this element, assume we should initialize
                            var initForElement_1 = function (obj) {
                                var instance = null;
                                if (Navigation.Tabs.ElementHasInstance(obj)) { //if element has instance, then just return that
                                    instance = Helper_1.Helper.GetDataIfPresent(obj, Navigation.Tabs.dataKey, Navigation.Tabs);
                                }
                                else {
                                    instance = new Navigation.Tabs(obj, methodOrOptions);
                                    obj.data(Navigation.Tabs.dataKey, instance);
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
            Tabs.RemoveFromJQuery = function (jq) {
                //no jQuery passed
                if (!jq) {
                    return null;
                }
                if (!jq.fn.hasOwnProperty("Tabs")) {
                    return jq;
                }
                delete jq.fn["Tabs"];
                return jq;
            };
            Tabs.pluginName = "Tabs";
            Tabs.dataKey = "tabs";
            return Tabs;
        }()); //Tabs class
        Navigation.Tabs = Tabs;
    })(Navigation = exports.Navigation || (exports.Navigation = {}));
    Navigation.Tabs.AttachToJQuery(jQueryModule);
});
//# sourceMappingURL=Tabs.js.map
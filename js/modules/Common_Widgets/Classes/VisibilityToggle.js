var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./WidgetBase", "./Helper", "jquery"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var WidgetBase_1 = require("./WidgetBase");
    var Helper_1 = require("./Helper");
    var jQueryModule = require("jquery");
    /**
     * Use this widget to toggle the visibility of 2 elements, based on interactions with a target
     * @example
    
     */
    var VisibilityToggle = /** @class */ (function (_super) {
        __extends(VisibilityToggle, _super);
        function VisibilityToggle(target, options) {
            var _this = _super.call(this, target, options, VisibilityToggle.defaultOptions) || this;
            _this.toggled = false;
            _this.elementsToHide = jQueryModule();
            _this.elementsToShow = jQueryModule();
            jQueryModule.extend({}, _this.exposedMethods, {});
            _this.OnCreate();
            return _this;
        }
        VisibilityToggle.prototype.OnCreate = function () {
            if (this.deleted) {
                return;
            }
            _super.prototype.OnCreate.call(this);
            //get the elements to toggle
            if (this.settings.hasOwnProperty("hideEvent")) {
                this.settings["hideEvent"] = VisibilityToggle.getEventFromOption(this.settings["hideEvent"]);
            }
            if (this.settings.hasOwnProperty("showEvent")) {
                this.settings["showEvent"] = VisibilityToggle.getEventFromOption(this.settings["showEvent"]);
            }
            //has data attributes (these don't override options)
            var cssClassesToHide = Helper_1.Helper.GetDataIfPresent(this.targetElement, "css-classes-to-hide");
            var cssIdsToHide = Helper_1.Helper.GetDataIfPresent(this.targetElement, "css-ids-to-hide");
            var cssClassesToShow = Helper_1.Helper.GetDataIfPresent(this.targetElement, "css-classes-to-show");
            var cssIdsToShow = Helper_1.Helper.GetDataIfPresent(this.targetElement, "css-ids-to-show");
            if (cssClassesToHide !== null) {
                this.settings["cssClassesToHide"] = cssClassesToHide;
            }
            if (cssClassesToShow !== null) {
                this.settings["cssClassesToShow"] = cssClassesToShow;
            }
            if (cssIdsToHide !== null) {
                this.settings["cssIdsToHide"] = cssIdsToHide;
            }
            if (cssIdsToShow !== null) {
                this.settings["cssIdsToShow"] = cssIdsToShow;
            }
            if (this.settings["cssClassesToHide"] !== "") {
                var classesToHide = this.settings["cssClassesToHide"].split(",");
                classesToHide = classesToHide.map(function (c) { return "." + c; });
                classesToHide = classesToHide.join(", ");
                var foundElements = jQueryModule(classesToHide);
                this.elementsToHide.add(foundElements);
            }
            if (this.settings["cssClassesToShow"] !== "") {
                var classesToShow = this.settings["cssClassesToShow"].split(",");
                classesToShow = classesToShow.map(function (c) { return "." + c; });
                classesToShow = classesToShow.join(", ");
                var foundElements = jQueryModule(classesToShow);
                this.elementsToShow.add(foundElements);
            }
            if (this.settings["cssIdsToHide"] !== "") {
                var cssIdsToHide_1 = this.settings["cssIdsToHide"].split(",");
                cssIdsToHide_1 = cssIdsToHide_1.map(function (c) { return "#" + c; });
                cssIdsToHide_1 = cssIdsToHide_1.join(", ");
                var foundElements = jQueryModule(cssIdsToHide_1);
                this.elementsToHide.add(foundElements);
            }
            if (this.settings["cssIdsToShow"] !== "") {
                var cssIdsToShow_1 = this.settings["cssIdsToShow"].split(",");
                cssIdsToShow_1 = cssIdsToShow_1.map(function (c) { return "#" + c; });
                cssIdsToShow_1 = cssIdsToShow_1.join(", ");
                var foundElements = jQueryModule(cssIdsToShow_1);
                this.elementsToShow.add(foundElements);
            }
            this.elementsToShow.add(this.settings["elementsToShow"]);
            this.elementsToHide.add(this.settings["elementsToHide"]);
            this.SaveElementState();
            this.AttachHandlers();
        };
        VisibilityToggle.prototype.AttachHandlers = function () {
            if (this.deleted) {
                return;
            }
            _super.prototype.AttachHandlers.call(this);
            //store reference to this class instance for binding to function closures
            var that = this;
            that.targetElement.on(that.settings["hideEvent"], function () {
                var $this = jQueryModule(this);
                if (that.toggled) {
                    //hide elements that are to be hidden
                }
                else if (that.settings["reverseToggle"] === true) {
                    //show elements that are to be hidden
                }
            });
            that.targetElement.on(that.settings["showEvent"], function () {
                var $this = jQueryModule(this);
                if (that.toggled) {
                    //show elements that are to be shown
                }
                else if (that.settings["reverseToggle"] === true) {
                    //hide elements that are to be shown
                }
            });
        };
        ;
        //removes handlers for this widget (eg: on buttons, etc)
        VisibilityToggle.prototype.RemoveHandlers = function () {
            if (this.deleted) {
                return;
            }
            _super.prototype.RemoveHandlers.call(this);
            this.targetElement.off();
        };
        //the function to call/called when this widget is to be destroyed
        VisibilityToggle.prototype.Destroy = function () {
            if (this.deleted) {
                return;
            }
            _super.prototype.Destroy.call(this);
            this.targetElement = null;
            this.settings = null;
        };
        VisibilityToggle.prototype.SaveElementState = function () {
            if (this.deleted) {
                return;
            }
            _super.prototype.SaveElementState.call(this);
            //store things we will modify about the element, as to restore it later
            //this.originalElementState["var"] = this.targetElement.prop
        };
        VisibilityToggle.prototype.RestoreElementState = function () {
            if (this.deleted) {
                return;
            }
            _super.prototype.RestoreElementState.call(this);
            //restore things we modified, from the old element state
        };
        VisibilityToggle.getEventFromOption = function (eventOptions) {
            var result = "";
            switch (eventOptions) {
                case "mouseenter":
                case "hover":
                    result = "mouseenter";
                    break;
                case "mouseleave":
                case "leave":
                    result = "mouseleave";
                    break;
                case "click":
                    result = "click";
                    break;
                default:
                    result = "click";
            }
        };
        VisibilityToggle.defaultOptions = {
            "hideEvent": "click",
            "showEvent": "click",
            "reverseToggle": false,
            "cssClassesToHide": "",
            "cssClassesToShow": "",
            "cssIdsToHide": "",
            "cssIdsToShow": "",
            "elementsToHide": jQueryModule(),
            "elementsToShow": jQueryModule()
        };
        VisibilityToggle.widgetDataName = "VisibilityToggle_instance";
        VisibilityToggle.pluginName = "VisibilityToggle";
        return VisibilityToggle;
    }(WidgetBase_1.WidgetBase));
    exports.VisibilityToggle = VisibilityToggle;
});
//# sourceMappingURL=VisibilityToggle.js.map
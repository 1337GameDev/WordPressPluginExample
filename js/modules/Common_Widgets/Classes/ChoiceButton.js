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
     * @example
        <div class="helpertooltip preventEvenBubble choiceButtonsContainer tooltipstered" id="choiceButton1">
            <label class="choiceTextLabel">
                Choice Text
            </label>
    
            <div class="choiceButtons btn-group">
                <label class="btn-primary btn">
                    <input name="choiceField1" type="radio" value="true">
                    Yes
                </label>
                <label class="active btn-primary btn">
                    <input checked="checked" name="choiceField1" type="radio" value="false">
                    No
                </label>
            </div>
        </div>
    
         <script>
            jQuery('.choiceButtonsContainer').ChoiceButton({ onSelectChoice: function(widget, name, choiceVal) {
                    console.log("Choice \"" + choiceVal + "\" was selected.");
                }
            });
         </script>
     */
    var ChoiceButton = /** @class */ (function (_super) {
        __extends(ChoiceButton, _super);
        function ChoiceButton(target, options) {
            var _this = _super.call(this, target, options, ChoiceButton.defaultOptions) || this;
            _this.choiceRadios = null; //the radio inputs for the choices
            _this.choiceLabels = null; //the labels for the choices (this is styled for the users to click on)
            _this.choiceGroupName = null; //the name for this "group" of choices (usually is some kind of question/setting this choice is answering)
            if (!target.hasClass("choiceButtonsContainer")) {
                console.warn("The target for this ChoiceButton was not a valid ChoiceButton.");
                return _this;
            }
            jQueryModule.extend({}, _this.exposedMethods, {
                "getValue": _this.getValue,
                "setOnSelect": _this.setOnSelect
            });
            _this.OnCreate();
            return _this;
        }
        ChoiceButton.prototype.OnCreate = function () {
            if (this.deleted) {
                return;
            }
            _super.prototype.OnCreate.call(this);
            this.choiceRadios = this.targetElement.find("input[type='radio']");
            this.choiceLabels = this.targetElement.find("label.btn");
            this.choiceGroupName = this.targetElement.find("input[type='radio']").first().prop("name");
            this.SaveElementState();
            this.AttachHandlers();
        };
        ChoiceButton.prototype.AttachHandlers = function () {
            if (this.deleted) {
                return;
            }
            _super.prototype.AttachHandlers.call(this);
            //store reference to this class instance for binding to function closures
            var that = this;
            that.choiceLabels.on("click", function () {
                var $this = jQueryModule(this);
                that.choiceLabels.removeClass("active");
                $this.addClass("active");
                var radioValue = that.getValue();
                Helper_1.Helper.ExecuteIfDefined(that.settings.onSelectChoice, [that, that.choiceGroupName, radioValue]);
            });
        };
        ;
        //removes handlers for this widget (eg: on buttons, etc)
        ChoiceButton.prototype.RemoveHandlers = function () {
            if (this.deleted) {
                return;
            }
            _super.prototype.RemoveHandlers.call(this);
            this.targetElement.off();
        };
        //the function to call/called when this widget is to be destroyed
        ChoiceButton.prototype.Destroy = function () {
            if (this.deleted) {
                return;
            }
            _super.prototype.Destroy.call(this);
            this.targetElement = null;
            this.settings = null;
        };
        ChoiceButton.prototype.SaveElementState = function () {
            if (this.deleted) {
                return;
            }
            _super.prototype.SaveElementState.call(this);
            //store things we will modify about the element, as to restore it later
            //this.originalElementState["var"] = this.targetElement.prop
        };
        ChoiceButton.prototype.RestoreElementState = function () {
            if (this.deleted) {
                return;
            }
            _super.prototype.RestoreElementState.call(this);
            //restore things we modified, from the old element state
        };
        ChoiceButton.prototype.getValue = function () {
            if (this.deleted) {
                return null;
            }
            var valueToReturn = null;
            var activeLabel = this.choiceLabels.filter(".active");
            if (activeLabel.length === 1) {
                valueToReturn = activeLabel.find("input[type='radio']").val();
            }
            else {
                console.log("Invalid active label for ChoiceButton: " + activeLabel.length + " were active.");
            }
            return valueToReturn;
        };
        ChoiceButton.prototype.setOnSelect = function (fn) {
            if (this.deleted) {
                return;
            }
            if (Helper_1.Helper.FunctionDefined(fn)) {
                this.settings.onSelectChoice = fn;
            }
        };
        ChoiceButton.defaultOptions = {
            onSelectChoice: function (widget, name, choiceVal) { console.log("Choice \"" + choiceVal + "\" selected."); }
        };
        ChoiceButton.widgetDataName = "ChoiceButton_instance";
        ChoiceButton.pluginName = "ChoiceButton";
        return ChoiceButton;
    }(WidgetBase_1.WidgetBase));
    exports.ChoiceButton = ChoiceButton;
});
//# sourceMappingURL=ChoiceButton.js.map
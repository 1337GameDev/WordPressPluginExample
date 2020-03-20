import {WidgetBase} from "./WidgetBase";
import {DynamicObject} from "./DynamicObject";
import {Helper} from "./Helper";
import * as jQueryModule from 'jquery';

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
export class ChoiceButton extends WidgetBase {
    private choiceRadios = null;//the radio inputs for the choices
    private choiceLabels = null;//the labels for the choices (this is styled for the users to click on)
    private choiceGroupName = null;//the name for this "group" of choices (usually is some kind of question/setting this choice is answering)

    private static defaultOptions:DynamicObject = {
        onSelectChoice: function (widget:ChoiceButton, name:string, choiceVal:any) { console.log("Choice \"" + choiceVal + "\" selected."); }
    };

    public static readonly widgetDataName:string = "ChoiceButton_instance";
    public static readonly pluginName:string = "ChoiceButton";

    constructor(target:JQuery, options:DynamicObject){
        super(target, options, ChoiceButton.defaultOptions);

        if (!target.hasClass("choiceButtonsContainer")) {
            console.warn("The target for this ChoiceButton was not a valid ChoiceButton.");
            return;
        }

        jQueryModule.extend({}, this.exposedMethods, {
            "getValue": this.getValue,
            "setOnSelect": this.setOnSelect
        });

        this.OnCreate();
    }

    protected OnCreate() {
        if(this.deleted) {
            return;
        }
        super.OnCreate();

        this.choiceRadios = this.targetElement.find("input[type='radio']");
        this.choiceLabels = this.targetElement.find("label.btn");
        this.choiceGroupName = this.targetElement.find("input[type='radio']").first().prop("name");

        this.SaveElementState();
        this.AttachHandlers();
    }

    public AttachHandlers() {
        if(this.deleted) {
            return;
        }
        super.AttachHandlers();

        //store reference to this class instance for binding to function closures
        let that = this;

        that.choiceLabels.on("click", function () {
            let $this = jQueryModule(this);
            that.choiceLabels.removeClass("active");
            $this.addClass("active");

            let radioValue = that.getValue();

            Helper.ExecuteIfDefined(that.settings.onSelectChoice, [that, that.choiceGroupName, radioValue]);
        })
    };

    //removes handlers for this widget (eg: on buttons, etc)
    public RemoveHandlers() {
        if(this.deleted) {
            return;
        }
        super.RemoveHandlers();

        this.targetElement.off();
    }

    //the function to call/called when this widget is to be destroyed
    public Destroy() {
        if(this.deleted) {
            return;
        }
        super.Destroy();

        this.targetElement = null;
        this.settings = null;
    }

    protected SaveElementState() {
        if(this.deleted) {
            return;
        }
        super.SaveElementState();

        //store things we will modify about the element, as to restore it later
        //this.originalElementState["var"] = this.targetElement.prop
    }

    protected RestoreElementState() {
        if(this.deleted) {
            return;
        }
        super.RestoreElementState();

        //restore things we modified, from the old element state
    }

    public getValue():any {
        if(this.deleted) {
            return null;
        }

        let valueToReturn = null;
        let activeLabel = this.choiceLabels.filter(".active");
        if (activeLabel.length === 1) {
            valueToReturn = activeLabel.find("input[type='radio']").val();
        } else {
            console.log("Invalid active label for ChoiceButton: " + activeLabel.length + " were active.");
        }

        return valueToReturn;
    }

    public setOnSelect(fn:(widget:ChoiceButton, name:string, choiceVal:any)=>void) {
        if(this.deleted) {
            return;
        }

        if (Helper.FunctionDefined(fn)) {
            this.settings.onSelectChoice = fn;
        }
    }
}
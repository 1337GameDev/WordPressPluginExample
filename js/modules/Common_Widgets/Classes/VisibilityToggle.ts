import {WidgetBase} from "./WidgetBase";
import {DynamicObject} from "./DynamicObject";
import {Helper} from "./Helper";
import * as jQueryModule from 'jquery';

/**
 * Use this widget to toggle the visibility of 2 elements, based on interactions with a target
 * @example

 */
export class VisibilityToggle extends WidgetBase {
    private toggled:boolean = false;
    private elementsToHide = jQueryModule();
    private elementsToShow = jQueryModule();

    private static defaultOptions:DynamicObject = {
        "hideEvent":"click",
        "showEvent":"click",
        "reverseToggle": false,
        "cssClassesToHide":"",
        "cssClassesToShow":"",
        "cssIdsToHide":"",
        "cssIdsToShow":"",
        "elementsToHide":jQueryModule(),
        "elementsToShow":jQueryModule()
    };

    public static readonly widgetDataName:string = "VisibilityToggle_instance";
    public static readonly pluginName:string = "VisibilityToggle";

    constructor(target:JQuery, options:DynamicObject){
        super(target, options, VisibilityToggle.defaultOptions);

        jQueryModule.extend({}, this.exposedMethods, {

        });

        this.OnCreate();
    }

    protected OnCreate() {
        if(this.deleted) {
            return;
        }
        super.OnCreate();

        //get the elements to toggle
        if(this.settings.hasOwnProperty("hideEvent")) {
            this.settings["hideEvent"] = VisibilityToggle.getEventFromOption(this.settings["hideEvent"]);
        }
        if(this.settings.hasOwnProperty("showEvent")) {
            this.settings["showEvent"] = VisibilityToggle.getEventFromOption(this.settings["showEvent"]);
        }

        //has data attributes (these don't override options)
        let cssClassesToHide = Helper.GetDataIfPresent(this.targetElement,"css-classes-to-hide");
        let cssIdsToHide = Helper.GetDataIfPresent(this.targetElement,"css-ids-to-hide");
        let cssClassesToShow = Helper.GetDataIfPresent(this.targetElement,"css-classes-to-show");
        let cssIdsToShow = Helper.GetDataIfPresent(this.targetElement,"css-ids-to-show");

        if(cssClassesToHide !== null) {
            this.settings["cssClassesToHide"] = cssClassesToHide;
        }
        if(cssClassesToShow !== null) {
            this.settings["cssClassesToShow"] = cssClassesToShow;
        }
        if(cssIdsToHide !== null) {
            this.settings["cssIdsToHide"] = cssIdsToHide;
        }
        if(cssIdsToShow !== null) {
            this.settings["cssIdsToShow"] = cssIdsToShow;
        }

        if(this.settings["cssClassesToHide"] !== "") {
            let classesToHide = this.settings["cssClassesToHide"].split(",");
            classesToHide = classesToHide.map(c => "."+c);
            classesToHide = classesToHide.join(", ");
            let foundElements = jQueryModule(classesToHide);
            this.elementsToHide.add(foundElements);
        }

        if(this.settings["cssClassesToShow"] !== "") {
            let classesToShow = this.settings["cssClassesToShow"].split(",");
            classesToShow = classesToShow.map(c => "."+c);
            classesToShow = classesToShow.join(", ");
            let foundElements = jQueryModule(classesToShow);
            this.elementsToShow.add(foundElements);
        }

        if(this.settings["cssIdsToHide"] !== "") {
            let cssIdsToHide = this.settings["cssIdsToHide"].split(",");
            cssIdsToHide = cssIdsToHide.map(c => "#"+c);
            cssIdsToHide = cssIdsToHide.join(", ");
            let foundElements = jQueryModule(cssIdsToHide);
            this.elementsToHide.add(foundElements);
        }

        if(this.settings["cssIdsToShow"] !== "") {
            let cssIdsToShow = this.settings["cssIdsToShow"].split(",");
            cssIdsToShow = cssIdsToShow.map(c => "#"+c);
            cssIdsToShow = cssIdsToShow.join(", ");
            let foundElements = jQueryModule(cssIdsToShow);
            this.elementsToShow.add(foundElements);
        }

        this.elementsToShow.add(this.settings["elementsToShow"]);
        this.elementsToHide.add(this.settings["elementsToHide"]);

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

        that.targetElement.on(that.settings["hideEvent"], function () {
            let $this = jQueryModule(this);
            if(that.toggled) {
                //hide elements that are to be hidden
            } else if(that.settings["reverseToggle"] === true) {
                //show elements that are to be hidden
            }
        });

        that.targetElement.on(that.settings["showEvent"], function () {
            let $this = jQueryModule(this);
            if(that.toggled) {
                //show elements that are to be shown
            } else if(that.settings["reverseToggle"] === true) {
                //hide elements that are to be shown
            }
        });
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

    private static getEventFromOption(eventOptions:string) {
        let result = "";
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
                result = "click"
        }
    }
}
import {WidgetBase} from "./WidgetBase";
import {Helper} from "./Helper";
import {DynamicObject} from "./DynamicObject";
import * as jQueryModule from 'jquery';
import {CommonWidgets} from "../Common_Widgets";
import {TypeChecker} from "./TypeChecker";
import {TimedAction} from './TimedAction';
import {GlobalWidgetSettings} from "./GlobalWidgetSettings";
import {SingleEditFieldOptions} from "./OptionsClasses";

export type SaveCompletedCallback = (savedVal:any, saveSuccess:boolean, showNotification:boolean) => void;
export enum possibleFieldTypes {
    unknown,
    select,
    multiselect,
    text,
    radio,
    checkbox
}

export enum possibleDataTypes {
    unknown,
    text,
    number,
    option,
    boolean,
    date,
    email,
    color,
    file,
    password,
    telephone,
    url
}

/**
 * @example
 * Example Input Format HTML
 <span class="radiogroup" id="testField" data-field-name="Test Field">
 <input type="radio" name="gender" value="male" data-value-label="Male"> Male
 <input type="radio" name="gender" value="female" data-value-label="Female"> Female
 <input type="radio" name="gender" value="other" data-value-label="Other"> Other
 </span>

 <input id="testField" type="text" value="Not Available" data-field-name="Test Field"/>

 <textarea id="testField" value="Example Text" data-field-name="Test Field"></textarea>

 <select id="testField" data-field-name="Test Field">
 <option value="0">Option 1</option>
 <option value="2">Option 2</option>
 <option value="4">Option 3</option>
 </select>

 <input type="checkbox" id="testField">

 <script>
    jQuery('#testField').SingleEditField();
 </script>
 **/
export class SingleEditField extends WidgetBase {
    private fieldName:string = null;

    readonly elementToHideAndShow:JQuery = null;//the element that will be hidden/shown when saving/editing

    private valueLabel:JQuery = null;
    private saveButton:JQuery = null;
    private editButton:JQuery = null;
    private cancelButton:JQuery = null;

    public static readonly widgetDataName:string = "SingleEditField_instance";
    public static readonly pluginName:string = "SingleEditField";

    private successIcon:JQuery = null;
    private errorIcon:JQuery = null;

    private loader:JQuery = null;

    readonly fieldType:possibleFieldTypes = possibleFieldTypes.unknown;
    readonly dataType:possibleDataTypes = possibleDataTypes.unknown;

    //the below is used for when a "custom" form (besides the single input) is used for handling this field
    private customForm:JQuery = null;

    private static defaultOptions:SingleEditFieldOptions = {
        saveFieldFunc: function (valueToSave:any, completeFunction: (valueSaved, success:boolean, showNotification:boolean)=>void) { console.log("The value \"" + valueToSave + "\" was entered."); completeFunction(valueToSave, true, false); },
        allowEditFunc: function () { return true; },
        allowSaveFunc: function () { return true; },
        unfocusCallback: function(){console.log('Unfocus');},
        validateBeforeSave: function (val:any, widgetRoot:JQuery) { console.log("The value \"" + val + "\" is valid."); return true; },
        editIcon: 'fa fa-pencil',
        defaultSaveButtonTitle: 'Save Changes',
        saveIcon: 'fa fa-floppy-o',
        defaultEditButtonTitle: 'Click To Edit',
        showCancelButton: false,
        cancelIcon: 'fa fa-times',
        defaultCancelButtonTitle: 'Cancel',
        loaderClass: 'widgetMiniLoader',
        showLoader: true,
        showNotifications: true,
        showTooltips: true,
        loaderDestination: '',
        defaultToFirstIfNoneSelected: true,
        statusIconShowTimeSecs: 1.5,
        checkedValueDisplay: function () { return "Checked"; },
        uncheckedValueDisplay: function () { return "Unchecked"; },
        noSelectedValueDisplay: "Nothing Selected",
        displayPlaceholderForEmptyText: true,
        emptyTextValueDisplay: "Not Present",
        valueLabelFunc: function () { return '<span class="editFieldLabel"></span>'; },
        valueFilterForLabel: function (val:any) {
            let that = this;
            let filteredVal = val;

            if (that.fieldType === possibleFieldTypes.checkbox) {
                if (val === 'checked') {
                    filteredVal = that.settings.checkedValueDisplay();
                } else {
                    filteredVal = that.settings.uncheckedValueDisplay();
                }
            } else if (that.fieldType === possibleFieldTypes.radio) {
                let checkedRadio = that.targetElement.find("input[type='radio'][value='" + val + "']");
                if (checkedRadio.data().hasOwnProperty("valueLabel")) {
                    filteredVal = checkedRadio.data("value-label");
                } else {
                    filteredVal = checkedRadio.val();
                }
            } else if (that.fieldType === possibleFieldTypes.select) {
                let selectedOption = that.targetElement.find("option[value='" + val + "']");
                if (selectedOption.length > 0) {
                    if (selectedOption.data().hasOwnProperty("valueLabel")) {
                        filteredVal = selectedOption.data("value-label");
                    } else {
                        filteredVal = selectedOption.text();
                    }
                } else {
                    filteredVal = that.settings.noSelectedValueDisplay;
                }
            } else if (that.fieldType === possibleFieldTypes.multiselect) {
                if (val.length > 0) {
                    filteredVal = "";
                    for (let i = 0; i < val.length;i++){
                        let selectedOption = that.targetElement.find("option[value='" + val[i] + "']");
                        if (i > 0) {
                            filteredVal += ", ";//add comma to separate elements
                        }

                        if (selectedOption.data().hasOwnProperty("valueLabel")) {
                            filteredVal += selectedOption.data("value-label");
                        } else {
                            filteredVal += selectedOption.text();
                        }
                    }
                } else {
                    filteredVal = that.settings.noSelectedValueDisplay;
                }

            } else {
                //assume as text/number (already in filteredVal)
                let emptyInputValue = (typeof filteredVal === 'undefined') || (filteredVal === null) || ((typeof filteredVal === 'string') && (filteredVal.trim() === ""));
                if (that.settings.displayPlaceholderForEmptyText && emptyInputValue) {
                    filteredVal = that.settings.emptyTextValueDisplay;
                }
            }

            return filteredVal;
        },
        autoSaveTime: 5000,
        autoSaveAfterChange: false,
        autoSaveTimerDataKey: "autosavetimer",
        showCustomForm: false,
        showCustomFormInsteadOfInput: false,
        beginEditCallback: function(widget:SingleEditField){},
        endEditCallback: function(widget:SingleEditField){}
    };

    constructor(target:JQuery, options:DynamicObject){
        super(target, options, SingleEditField.defaultOptions);

        if (!target.is("input") && !target.is("select") && !target.is("textarea") && !target.hasClass("radiogroup")) {
            console.warn("The target for this SingleEditField was not an input.");
            return;
        }

        jQueryModule.extend({}, this.exposedMethods, {
            "SetValue":this.SetValue,
            "ShowLoader":this.ShowLoader,
            "HideLoader":this.HideLoader,
            "GetInputValue":this.GetInputValue,
            "GetInputValueForLabel":this.GetInputValueForLabel,
            "ShowSaveSuccessNotification":this.ShowSaveSuccessNotification,
            "ShowSaveFailNotification":this.ShowSaveFailNotification,
            "SetSaveButtonTitle":this.SetSaveButtonTitle,
            "SetEditButtonTitle":this.SetEditButtonTitle,
            "RevertSaveButtonTitle":this.RevertSaveButtonTitle,
            "RevertEditButtonTitle":this.RevertEditButtonTitle,
            "IsEditing":this.IsEditing,
            "BeginEdit":this.BeginEdit,
            "EndEdit":this.EndEdit,
            "DisableUserInteraction":this.DisableUserInteraction,
            "EnableUserInteraction":this.EnableUserInteraction,
            "ResetAutoSaving":this.ResetAutoSaving,
            "DisableAutoSaving":this.DisableAutoSaving,
            "HideSaveButton":this.HideSaveButton,
            "ShowSaveButton":this.ShowSaveButton,
            "HideCustomForm":this.HideCustomForm,
            "ShowCustomForm":this.ShowCustomForm
        });

        this.elementToHideAndShow = target;
        this.widgetRootContainer = target.parent();
        this.customForm = this.widgetRootContainer.find(".customform");

        let typeAttr = target.attr("type");
        let targetParent = target.parent();
        if (targetParent.hasClass("bootstrap-select")) {
            this.fieldType = possibleFieldTypes.multiselect;
            this.dataType = possibleDataTypes.option;

            //this is needed because the multiselect widget adds a new parent to the select target
            this.widgetRootContainer = this.widgetRootContainer.parent();
            this.elementToHideAndShow = targetParent;
            if (typeof jQueryModule.fn.selectpicker === 'undefined' && GlobalWidgetSettings.dependencyWarningMessageDisplay) {
                console.warn("The bootstrap plugin 'selectpicker' was not found. Please include it to enable selectpicker usage for the 'SingleEditField' widget.");
            }
        } else if (target.is("select")) {
            this.fieldType = possibleFieldTypes.select;
            this.dataType = possibleDataTypes.option;
        } else if (target.is("textarea")) {
            this.fieldType = possibleFieldTypes.text;
            this.dataType = possibleDataTypes.text;
        } else if (target.is("input")) {
            if (typeAttr === "checkbox") {
                this.fieldType = possibleFieldTypes.checkbox;
                this.dataType = possibleDataTypes.boolean;
            } else {//assume all other types are text (times, dates, numbers are all stored as text)
                this.fieldType = possibleFieldTypes.text;
                this.dataType = possibleDataTypes.text;

                let inputType = target.prop('type');
                switch (inputType) {
                    case "color":
                        this.dataType = possibleDataTypes.color;
                        break;
                    case "date":
                    case "datetime-local":
                    case "month":
                    case "week":
                    case "time":
                        this.dataType = possibleDataTypes.date;
                        break;
                    case "email":
                        this.dataType = possibleDataTypes.email;
                        break;
                    case "file":
                    case "image":
                        this.dataType = possibleDataTypes.file;
                        break;
                    case "number":
                    case "range":
                        this.dataType = possibleDataTypes.number;
                        break;
                    case "password":
                        this.dataType = possibleDataTypes.password;
                        break;
                    case "telephone":
                        this.dataType = possibleDataTypes.telephone;
                        break;
                    case "url":
                        this.dataType = possibleDataTypes.url;
                        break;
                    case "text":
                    case "hidden":
                    case "search":
                        this.dataType = possibleDataTypes.text;
                        break;
                    default:
                        this.dataType = possibleDataTypes.unknown;
                }
            }
        } else if (target.hasClass("radiogroup")) {
            this.fieldType = possibleFieldTypes.radio;
            this.dataType = possibleDataTypes.option;
        }

        this.OnCreate();

        target.data(SingleEditField.widgetDataName, this);
    }

    public Destroy() {
        if(this.deleted) {
            return;
        }
        super.Destroy();

        if (this.settings.loaderDestination !== '') {
            this.loader.remove();
        }

        //destroy elements
        this.widgetRoot.before(this.elementToHideAndShow);
        this.widgetRoot.remove();
        this.widgetRoot = null;
        this.widgetRootContainer = null;
        this.valueLabel = null;
        this.saveButton = null;
        this.editButton = null;
        this.cancelButton = null;
        this.successIcon = null;
        this.errorIcon = null;

        this.loader = null;
        this.elementToHideAndShow.show();

        this.targetElement = null;
        this.settings = null;
    }

    protected OnCreate() {
        if(this.deleted) {
            return;
        }
        super.OnCreate();

        let that = this;

        //default any inputs if nothing selected?
        if (that.settings.defaultToFirstIfNoneSelected) {
            if (that.fieldType === possibleFieldTypes.select) {
                let selected = that.targetElement.find("option:selected");
                if (selected.length === 0) {
                    let first = that.targetElement.find("option:first-child");
                    first.prop("selected", true);
                }
            } else if(that.fieldType === possibleFieldTypes.radio){
                let selected = that.targetElement.find("input[type='radio']:selected");
                if (selected.length === 0) {
                    let first = that.targetElement.find("input[type='radio']:first-child");
                    first.prop("checked", true);
                }
            } else if (that.fieldType === possibleFieldTypes.multiselect) {
                //possible to select nothing, so allow this
            }
        }

        //add new html
        that.widgetRoot = jQueryModule('<span class="widgetRoot singleEditFieldContainer"></span>');

        let saveButtonHtml = '<i class="' + that.settings.saveIcon + ' widgetButton addTooltip saveButton" aria-hidden="true" title="'+that.settings.defaultSaveButtonTitle+'"></i>';
        that.saveButton = jQueryModule(saveButtonHtml);
        let editButtonHtml = '<i class="' + that.settings.editIcon + ' widgetButton addTooltip editButton" aria-hidden="true" title="'+that.settings.defaultEditButtonTitle+'"></i>';
        that.editButton = jQueryModule(editButtonHtml);

        if (that.settings.showCancelButton) {
            let cancelButtonHtml = '<i class="' + that.settings.cancelIcon + ' widgetButton addTooltip cancelButton" aria-hidden="true" title="' + that.settings.defaultCancelButtonTitle + '"></i>';
            that.cancelButton = jQueryModule(cancelButtonHtml);
        }

        let labelHtml = that.settings.valueLabelFunc.apply(that);
        that.valueLabel = jQueryModule(labelHtml);
        //update the label text
        let val = that.GetInputValueForLabel();
        that.valueLabel.empty().append(val);
        that.valueLabel.appendTo(that.widgetRoot);

        //insert the "widget" elements after the target
        //then move the target inside the "widget" element root
        that.widgetRoot.insertAfter(that.elementToHideAndShow);
        that.elementToHideAndShow.appendTo(that.widgetRoot);

        let applyWidthLimit = false;
        if(that.fieldType === possibleFieldTypes.text) {//a text input based field
            if(that.dataType === possibleDataTypes.text) {//actually only text
                applyWidthLimit = true;
            }
        } else {
            applyWidthLimit = true;
        }

        if(applyWidthLimit) {
            that.targetElement.css("width", "calc(100% - 80px)");
        }
        that.targetElement.css("position", "relative");

        that.customForm.appendTo(that.widgetRoot);

        that.editButton.appendTo(that.widgetRoot);
        that.saveButton.appendTo(that.widgetRoot);
        if (that.settings.showCancelButton) {
            that.cancelButton.appendTo(that.widgetRoot);
        }

        if (that.settings.showLoader) {
            let loaderHtml = '<span class="' + that.settings.loaderClass + 'Container"><div class="' + that.settings.loaderClass + '"></div></span>';
            that.loader = jQueryModule(loaderHtml);
            if (that.settings.loaderDestination !== '') {
                let trg = jQueryModule(that.settings.loaderDestination);
                if (trg.length > 0) {
                    that.loader.appendTo(trg);
                } else {
                    console.warn("The loader destination of \"" + that.settings.loaderDestination + "\" was not found.");
                }
            } else {
                that.loader.appendTo(that.widgetRoot);
            }
        }

        let successIconHtml = '<i class="statusIcon greenIcon fa fa-check-circle addTooltip" aria-hidden="true" title="Saving was successful"></i>';
        that.successIcon = jQueryModule(successIconHtml);
        let errorIconHtml = '<i class="statusIcon redIcon fa fa-times-circle addTooltip" aria-hidden="true" title="There was an error saving"></i>';
        that.errorIcon = jQueryModule(errorIconHtml);
        that.successIcon.appendTo(that.widgetRoot);
        that.errorIcon.appendTo(that.widgetRoot);

        that.targetElement.hide();
        that.elementToHideAndShow.hide();
        that.HideLoader();

        that.HideSaveButton();
        that.HideCustomForm();

        if (that.settings.showCancelButton) {
            that.cancelButton.hide();//conditional, because the cancel button would be null otherwise
        }

        that.successIcon.hide();
        that.errorIcon.hide();

        //set the field name
        if (that.targetElement.data().hasOwnProperty("fieldName")) {
            that.fieldName = that.targetElement.data("field-name");
        }

        that.targetElement.prop("editing", false);

        this.SaveElementState();
        this.AttachHandlers();
    }

    protected AttachHandlers() {
        if(this.deleted) {
            return;
        }
        super.AttachHandlers();

        let that = this;
        that.editButton.on("click", function () {
            that.BeginEdit();
        });

        that.saveButton.on("click", function () {
            if (!that.settings.allowSaveFunc.apply(that)) {
                return;
            }

            let $this = jQueryModule(this);
            if ($this.hasClass("disabled")) {
                return;
            }

            //get value from input
            let valueToSave = that.GetInputValue();

            if (!that.settings.validateBeforeSave.apply(that,[valueToSave, that.widgetRoot])) {
                return;
            }

            that.DisableUserInteraction();
            that.ShowLoader();
            if (that.settings.showCancelButton) {
                Helper.SetAsDisabled(that.cancelButton);
            }

            let saveCompletedFunc = function (savedVal, saveSuccess, showNotification) {
                if ((typeof saveSuccess === 'undefined') || (saveSuccess === null)) {
                    saveSuccess = false;
                }

                if ((typeof showNotification === 'undefined') || (showNotification === null)) {
                    showNotification = false;
                }

                that.EndEdit();

                if (showNotification) {
                    if (saveSuccess) {
                        that.ShowSaveSuccessNotification();
                    } else {
                        that.ShowSaveFailNotification();
                    }
                }

                if (that.settings.showCancelButton) {
                    Helper.RemoveDisabled(that.cancelButton);
                }
            };

            try {
                that.settings.saveFieldFunc.apply(that,[valueToSave, function (valueSaved, success:boolean = false, showNotification:boolean = false) {
                    if (success) {
                        let val = that.GetInputValueForLabel();
                        that.valueLabel.empty().append(val);
                    }
                    saveCompletedFunc(valueSaved, success, showNotification);
                }]);
            } catch (ex) {
                saveCompletedFunc(valueToSave, false, false);
                throw ex;
            }
        });

        if (that.settings.showCancelButton) {
            that.cancelButton.on("click", function () {
                that.EndEdit();
            });
        }

        //enable tooltips
        that.EnableTooltips();

        //add onfocusout method
        that.widgetRootContainer.on("focusout", function (e) {
            e.stopPropagation();
            let $this = jQueryModule(this);

            // let the browser set focus on the newly clicked elem before check
            setTimeout(function () {
                let focusedChildren = $this.find(':focus');
                let hoverChildren = $this.find(':hover');
                let activeChildren = $this.find(':hover');
                if ((focusedChildren.length === 0) && (hoverChildren.length === 0) && (activeChildren.length === 0)) {
                    //no "action inside the container / widget
                    if (that.settings.autoSaveAfterChange) {
                        //trigger the "timer" to save after a set time
                        that.ResetAutoSaving();
                    }
                }
            }, 0);
        });
    };

    protected RemoveHandlers() {
        if(this.deleted) {
            return;
        }
        super.RemoveHandlers();

        this.editButton.off();
        this.saveButton.off();

        if (this.settings.showCancelButton) {
            this.saveButton.off();
        }
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

    public SetValue(newValue:any, updateLabel:boolean) {
        if(this.deleted) {
            return;
        }

        if (this.fieldType === possibleFieldTypes.checkbox) {
            let checkboxInput = this.targetElement.find("input[type='checkbox']");
            if ((newValue === 'checked') || (newValue === 'true') || ((typeof newValue === 'boolean') && (newValue))) {
                checkboxInput.prop('checked', true);
            } else {
                checkboxInput.prop('checked', false);
            }
        } else if (this.fieldType === possibleFieldTypes.radio) {
            let checkedRadio = this.targetElement.find("input[type='radio'][value='" + newValue + "']");
            if (typeof checkedRadio !== 'undefined') {
                this.targetElement.find("input[type='radio']").prop('checked', false);//reset all checkboxes
                if ((newValue === 'checked') || (newValue === 'true') || ((typeof newValue === 'boolean') && (newValue))) {
                    checkedRadio.prop('checked', true);
                } else {
                    checkedRadio.prop('checked', false);
                }
            }
        } else if (this.fieldType === possibleFieldTypes.select) {
            let selectedOption = this.targetElement.find("option[value='" + newValue + "']");
            if (selectedOption.length > 0) {
                this.targetElement.val(newValue);
            }
        } else if (this.fieldType === possibleFieldTypes.multiselect) {
            if (newValue.length > 0) {
                this.targetElement.find("option:selected").prop("selected", false);
                (<any>this.targetElement).selectpicker('deselectAll');

                for (let i = 0; i < newValue.length; i++) {
                    let optionToSelect = this.targetElement.find("option[value='" + newValue[i] + "']");
                    if (optionToSelect.length > 0) {
                        //value is a valid option
                        optionToSelect.prop('selected', true);
                    }
                }//for loop over passed values
                (<any>this.targetElement).selectpicker('select', newValue);
            }//value isn't a valid or non-empty list
        } else {
            //assume as text/number (already in filteredVal)
            this.targetElement.val(newValue);
        }

        if (updateLabel) {
            this._updateLabel(newValue);
        }
    }

    protected _updateLabel(value: any) {
        if(this.deleted) {
            return;
        }

        let filteredVal = this.settings.valueFilterForLabel.apply(this,[value]);
        this.valueLabel.empty().append(filteredVal);
    }

    public ShowLoader() {
        if(this.deleted) {
            return;
        }

        if (this.settings.showLoader && this.loader !== null) {
            this.loader.show();
        }
    }

    public HideLoader() {
        if(this.deleted) {
            return;
        }

        if (this.settings.showLoader && this.loader !== null) {
            this.loader.hide();
        }
    }

    public GetInputValue():any {
        if(this.deleted) {
            return;
        }

        let value = null;
        if (this.fieldType === possibleFieldTypes.radio) {
            let checkedRadio = this.targetElement.find("input[type='radio']:checked");
            value = checkedRadio.val();
        } else if (this.fieldType === possibleFieldTypes.checkbox) {
            value = this.targetElement.find("input[type='checkbox']:checked");
            if (value.length > 0) {
                value = 'checked';
            } else {
                value = 'unchecked';
            }
        } else if (this.fieldType === possibleFieldTypes.multiselect) {
            let selectedOptions = this.targetElement.find("option:selected");
            value = [];
            if (selectedOptions.length > 0) {
                selectedOptions.each(function (idx, option) {
                    value.push(jQueryModule(option).val() );
                });
            }
        } else {
            //just get the val
            value = this.targetElement.val();
        }

        if (value === null) {
            value = -1;
        }
        return value;
    }

    public GetInputValueForLabel():any {
        if(this.deleted) {
            return;
        }

        let val = this.GetInputValue();
        return this.settings.valueFilterForLabel.apply(this,[val]);
    }

    public ShowSaveSuccessNotification(notificationInfo:any = null) {
        if(this.deleted) {
            return;
        }

        let that = this;
        this.successIcon.show();
        setTimeout(function () {
            that.successIcon.fadeOut(500);
        }, that.settings.statusIconShowTimeSecs * 1000);

        if (this.settings.showNotifications && CommonWidgets.GlobalWidgetSettings.Notifications.ShowNotifications) {
            let msg = "";
            let title = "";

            if ((typeof notificationInfo === 'undefined') || (notificationInfo === null) || (typeof notificationInfo !== 'object')) {
                msg = " was saved.";
                title = "Saved!";
                if (this.fieldName !== null) {
                    msg = this.fieldName + msg;
                } else {
                    msg = "The field" + msg;
                }
            } else {
                msg = notificationInfo.message;
                title = notificationInfo.title;
            }

            Helper.ShowWidgetNotification(title, msg, "success");
        }
    }

    public ShowSaveFailNotification(notificationInfo:any = null) {
        if(this.deleted) {
            return;
        }

        this.errorIcon.show();
        if (this.settings.showNotifications && CommonWidgets.GlobalWidgetSettings.Notifications.ShowNotifications) {
            let msg = "";
            let title = "";

            if ((notificationInfo === null) || (typeof notificationInfo !== 'object')) {
                msg = " was not saved.";
                title = "Not Saved!";
                if (this.fieldName !== null) {
                    msg = this.fieldName + msg;
                } else {
                    msg = "The field" + msg;
                }
            } else {
                msg = notificationInfo.message;
                title = notificationInfo.title;
            }

            Helper.ShowWidgetNotification(title, msg, "danger");
        }
    }

    //the method to use to modify the save button label after initialized (and then can be set back to the default)
    public SetSaveButtonTitle(text:string) {
        if(this.deleted) {
            return;
        }

        this.saveButton.prop('title', text);
        if (typeof jQueryModule.tooltipster !== 'undefined' && this.settings.showTooltips && CommonWidgets.GlobalWidgetSettings.Tooltips.ShowTooltips) {
            this.saveButton.tooltipster('content', text);
        }
    }
    //the method to use to modify the edit button label after initialized (and then can be set back to the default)
    public SetEditButtonTitle(text:string) {
        if(this.deleted) {
            return;
        }

        this.editButton.prop('title', text);
        if (typeof jQueryModule.tooltipster !== 'undefined' && this.settings.showTooltips && CommonWidgets.GlobalWidgetSettings.Tooltips.ShowTooltips) {
            this.editButton.tooltipster('content', text);
        }
    }
    //restores the save button title attributes (used for tooltips) to its default
    public RevertSaveButtonTitle() {
        if(this.deleted) {
            return;
        }

        this.saveButton.prop('title', this.settings.defaultSaveButtonTitle);
        if (typeof jQueryModule.tooltipster !== 'undefined') {
            this.saveButton.tooltipster('content', this.settings.defaultSaveButtonTitle);
        }
    }
    //restores the edit button title attributes (used for tooltips) to its default
    public RevertEditButtonTitle() {
        if(this.deleted) {
            return;
        }

        this.editButton.prop('title', this.settings.defaultEditButtonTitle);
        if (typeof jQueryModule.tooltipster !== 'undefined') {
            this.editButton.tooltipster('content', this.settings.defaultEditButtonTitle);
        }
    }

    //used to fetch if this widget is in "edit" mode
    public IsEditing() {
        if(this.deleted) {
            return false;
        }

        return this.targetElement.prop("editing");
    }

    //the method to call when wanting to destroy (dispose) of tooltip functionality (disable tooltips if you want to show/hide them)
    public DestroyTooltips():boolean {
        if(this.deleted) {
            return false;
        }

        if (typeof jQueryModule.tooltipster !== 'undefined') {
            let tooltips = this.widgetRoot.find(".addTooltip").tooltipster("destroy");
            return true;
        } else {
            if(GlobalWidgetSettings.dependencyWarningMessageDisplay) {
                console.warn("The jQuery plugin 'Tooltipster' was not found. Please include it to destroy tool-tips for the 'SingleEditField' widget.");
            }

            return false;
        }
    }

    //the method to call to temporarily disable tooltips
    public DisableTooltips():boolean {
        if(this.deleted) {
            return false;
        }

        if (typeof jQueryModule.tooltipster !== 'undefined') {
            this.widgetRoot.find(".addTooltip").tooltipster("disable");
            return true;
        } else {
            if(GlobalWidgetSettings.dependencyWarningMessageDisplay) {
                console.warn("The jQuery plugin 'Tooltipster' was not found. Please include it to disable tool-tips for the 'SingleEditField' widget.");
            }

            return false;
        }
    }
    //the method to call to initialize / enable tooltips
    public EnableTooltips():boolean {
        if(this.deleted) {
            return false;
        }

        if (typeof jQueryModule.tooltipster !== 'undefined') {
            if (this.settings.showTooltips && CommonWidgets.GlobalWidgetSettings.Tooltips.ShowTooltips) {
                let tooltips = this.widgetRoot.find(".addTooltip").tooltipster();
                tooltips.tooltipster("enable");
                return true;
            } else {
                console.log("Tooltips for the widget 'SingleEditField' are disabled.");
            }
        } else {
            if (GlobalWidgetSettings.dependencyWarningMessageDisplay) {
                console.warn("The jQuery plugin 'Tooltipster' was not found. Please include it to enable tool-tips for the 'SingleEditField' widget.");
            }
        }
    }

    //use this method to ENTER edit mode
    public BeginEdit() {
        if(this.deleted) {
            return;
        }

        if (!this.settings.allowEditFunc.apply(this)) {
            return;
        }

        this.valueLabel.hide();

        if (!TypeChecker.isBooleanOrFunctionTrue(this.settings.showCustomFormInsteadOfInput)) {
            this.elementToHideAndShow.show();
            this.ShowSaveButton();
        }

        if (TypeChecker.isBooleanOrFunctionTrue(this.settings.showCustomForm) ) {
            this.ShowCustomForm();
        }


        if (this.settings.showCancelButton) {
            this.cancelButton.show();
        }

        this.editButton.hide();
        this.successIcon.hide();
        this.errorIcon.hide();
        this.targetElement.prop("editing", true);
        this.EnableUserInteraction();

        // a custom user defined function to be invoked when editing is transitioned TO
        Helper.ExecuteIfDefined(this.settings.beginEditCallback, this);
    }

    //use this method to EXIT edit mode
    public EndEdit() {
        if(this.deleted) {
            return;
        }

        this.HideLoader();
        this.valueLabel.show();
        this.elementToHideAndShow.hide();
        this.HideCustomForm();
        this.HideSaveButton();
        if (this.settings.showCancelButton) {
            this.cancelButton.hide();
        }
        this.editButton.show();
        this.EnableUserInteraction();
        this.targetElement.prop("editing", false);
        // a custom user defined function to be invoked when editing is transitioned FROM
        Helper.ExecuteIfDefined(this.settings.endEditCallback, this);

    }

    public DisableUserInteraction() {
        if(this.deleted) {
            return;
        }

        Helper.SetAsReadOnly(this.targetElement);
        Helper.SetAsDisabled(this.targetElement);
        Helper.SetAsReadOnly(this.saveButton);
        Helper.SetAsDisabled(this.saveButton);
        if (this.settings.showCancelButton) {
            Helper.SetAsDisabled(this.cancelButton);
        }
    };

    public EnableUserInteraction() {
        if(this.deleted) {
            return;
        }

        Helper.RemoveReadOnly(this.targetElement);
        Helper.RemoveDisabled(this.targetElement);
        Helper.RemoveReadOnly(this.saveButton);
        Helper.RemoveDisabled(this.saveButton);
        if (this.settings.showCancelButton) {
            Helper.RemoveDisabled(this.cancelButton);
        }
    }

    public ResetAutoSaving() {
        if(this.deleted) {
            return;
        }

        let that = this;
        that.settings.autoSaveAfterChange = true;

        let dataInstance = Helper.GetDataIfPresent(that.targetElement, that.settings.autoSaveTimerDataKey, TimedAction);
        if (dataInstance === null) {
            dataInstance = new TimedAction(function () {
                that.saveButton.click();
            }, { maxTime: that.settings.autoSaveTime });
            that.targetElement.data(that.settings.autoSaveTimerDataKey, dataInstance);
        }

        dataInstance.Reset();

    }

    public DisableAutoSaving() {
        if(this.deleted) {
            return;
        }

        let that = this;
        that.settings.autoSaveAfterChange = false;

        let dataInstance = Helper.GetDataIfPresent(that.targetElement, that.settings.autoSaveTimerDataKey, TimedAction);
        if (dataInstance !== null) {
            dataInstance.Stop();
        }
    }

    public HideSaveButton() {
        if(this.deleted) {
            return;
        }

        this.saveButton.hide();
    }

    public ShowSaveButton() {
        if(this.deleted) {
            return;
        }

        this.saveButton.show();
    }

    public HideCustomForm() {
        if(this.deleted) {
            return;
        }

        this.customForm.hide();
    }

    public ShowCustomForm() {
        if(this.deleted) {
            return;
        }

        this.customForm.show();
    }
}
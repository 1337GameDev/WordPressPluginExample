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
        define(["require", "exports", "./WidgetBase", "./Helper", "jquery", "../Common_Widgets", "./TypeChecker", "./TimedAction", "./GlobalWidgetSettings"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var WidgetBase_1 = require("./WidgetBase");
    var Helper_1 = require("./Helper");
    var jQueryModule = require("jquery");
    var Common_Widgets_1 = require("../Common_Widgets");
    var TypeChecker_1 = require("./TypeChecker");
    var TimedAction_1 = require("./TimedAction");
    var GlobalWidgetSettings_1 = require("./GlobalWidgetSettings");
    var possibleFieldTypes;
    (function (possibleFieldTypes) {
        possibleFieldTypes[possibleFieldTypes["unknown"] = 0] = "unknown";
        possibleFieldTypes[possibleFieldTypes["select"] = 1] = "select";
        possibleFieldTypes[possibleFieldTypes["multiselect"] = 2] = "multiselect";
        possibleFieldTypes[possibleFieldTypes["text"] = 3] = "text";
        possibleFieldTypes[possibleFieldTypes["radio"] = 4] = "radio";
        possibleFieldTypes[possibleFieldTypes["checkbox"] = 5] = "checkbox";
    })(possibleFieldTypes = exports.possibleFieldTypes || (exports.possibleFieldTypes = {}));
    var possibleDataTypes;
    (function (possibleDataTypes) {
        possibleDataTypes[possibleDataTypes["unknown"] = 0] = "unknown";
        possibleDataTypes[possibleDataTypes["text"] = 1] = "text";
        possibleDataTypes[possibleDataTypes["number"] = 2] = "number";
        possibleDataTypes[possibleDataTypes["option"] = 3] = "option";
        possibleDataTypes[possibleDataTypes["boolean"] = 4] = "boolean";
        possibleDataTypes[possibleDataTypes["date"] = 5] = "date";
        possibleDataTypes[possibleDataTypes["email"] = 6] = "email";
        possibleDataTypes[possibleDataTypes["color"] = 7] = "color";
        possibleDataTypes[possibleDataTypes["file"] = 8] = "file";
        possibleDataTypes[possibleDataTypes["password"] = 9] = "password";
        possibleDataTypes[possibleDataTypes["telephone"] = 10] = "telephone";
        possibleDataTypes[possibleDataTypes["url"] = 11] = "url";
    })(possibleDataTypes = exports.possibleDataTypes || (exports.possibleDataTypes = {}));
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
    var SingleEditField = /** @class */ (function (_super) {
        __extends(SingleEditField, _super);
        function SingleEditField(target, options) {
            var _this = _super.call(this, target, options, SingleEditField.defaultOptions) || this;
            _this.fieldName = null;
            _this.elementToHideAndShow = null; //the element that will be hidden/shown when saving/editing
            _this.valueLabel = null;
            _this.saveButton = null;
            _this.editButton = null;
            _this.cancelButton = null;
            _this.successIcon = null;
            _this.errorIcon = null;
            _this.loader = null;
            _this.fieldType = possibleFieldTypes.unknown;
            _this.dataType = possibleDataTypes.unknown;
            //the below is used for when a "custom" form (besides the single input) is used for handling this field
            _this.customForm = null;
            if (!target.is("input") && !target.is("select") && !target.is("textarea") && !target.hasClass("radiogroup")) {
                console.warn("The target for this SingleEditField was not an input.");
                return _this;
            }
            jQueryModule.extend({}, _this.exposedMethods, {
                "SetValue": _this.SetValue,
                "ShowLoader": _this.ShowLoader,
                "HideLoader": _this.HideLoader,
                "GetInputValue": _this.GetInputValue,
                "GetInputValueForLabel": _this.GetInputValueForLabel,
                "ShowSaveSuccessNotification": _this.ShowSaveSuccessNotification,
                "ShowSaveFailNotification": _this.ShowSaveFailNotification,
                "SetSaveButtonTitle": _this.SetSaveButtonTitle,
                "SetEditButtonTitle": _this.SetEditButtonTitle,
                "RevertSaveButtonTitle": _this.RevertSaveButtonTitle,
                "RevertEditButtonTitle": _this.RevertEditButtonTitle,
                "IsEditing": _this.IsEditing,
                "BeginEdit": _this.BeginEdit,
                "EndEdit": _this.EndEdit,
                "DisableUserInteraction": _this.DisableUserInteraction,
                "EnableUserInteraction": _this.EnableUserInteraction,
                "ResetAutoSaving": _this.ResetAutoSaving,
                "DisableAutoSaving": _this.DisableAutoSaving,
                "HideSaveButton": _this.HideSaveButton,
                "ShowSaveButton": _this.ShowSaveButton,
                "HideCustomForm": _this.HideCustomForm,
                "ShowCustomForm": _this.ShowCustomForm
            });
            _this.elementToHideAndShow = target;
            _this.widgetRootContainer = target.parent();
            _this.customForm = _this.widgetRootContainer.find(".customform");
            var typeAttr = target.attr("type");
            var targetParent = target.parent();
            if (targetParent.hasClass("bootstrap-select")) {
                _this.fieldType = possibleFieldTypes.multiselect;
                _this.dataType = possibleDataTypes.option;
                //this is needed because the multiselect widget adds a new parent to the select target
                _this.widgetRootContainer = _this.widgetRootContainer.parent();
                _this.elementToHideAndShow = targetParent;
                if (typeof jQueryModule.fn.selectpicker === 'undefined' && GlobalWidgetSettings_1.GlobalWidgetSettings.dependencyWarningMessageDisplay) {
                    console.warn("The bootstrap plugin 'selectpicker' was not found. Please include it to enable selectpicker usage for the 'SingleEditField' widget.");
                }
            }
            else if (target.is("select")) {
                _this.fieldType = possibleFieldTypes.select;
                _this.dataType = possibleDataTypes.option;
            }
            else if (target.is("textarea")) {
                _this.fieldType = possibleFieldTypes.text;
                _this.dataType = possibleDataTypes.text;
            }
            else if (target.is("input")) {
                if (typeAttr === "checkbox") {
                    _this.fieldType = possibleFieldTypes.checkbox;
                    _this.dataType = possibleDataTypes.boolean;
                }
                else { //assume all other types are text (times, dates, numbers are all stored as text)
                    _this.fieldType = possibleFieldTypes.text;
                    _this.dataType = possibleDataTypes.text;
                    var inputType = target.prop('type');
                    switch (inputType) {
                        case "color":
                            _this.dataType = possibleDataTypes.color;
                            break;
                        case "date":
                        case "datetime-local":
                        case "month":
                        case "week":
                        case "time":
                            _this.dataType = possibleDataTypes.date;
                            break;
                        case "email":
                            _this.dataType = possibleDataTypes.email;
                            break;
                        case "file":
                        case "image":
                            _this.dataType = possibleDataTypes.file;
                            break;
                        case "number":
                        case "range":
                            _this.dataType = possibleDataTypes.number;
                            break;
                        case "password":
                            _this.dataType = possibleDataTypes.password;
                            break;
                        case "telephone":
                            _this.dataType = possibleDataTypes.telephone;
                            break;
                        case "url":
                            _this.dataType = possibleDataTypes.url;
                            break;
                        case "text":
                        case "hidden":
                        case "search":
                            _this.dataType = possibleDataTypes.text;
                            break;
                        default:
                            _this.dataType = possibleDataTypes.unknown;
                    }
                }
            }
            else if (target.hasClass("radiogroup")) {
                _this.fieldType = possibleFieldTypes.radio;
                _this.dataType = possibleDataTypes.option;
            }
            _this.OnCreate();
            target.data(SingleEditField.widgetDataName, _this);
            return _this;
        }
        SingleEditField.prototype.Destroy = function () {
            if (this.deleted) {
                return;
            }
            _super.prototype.Destroy.call(this);
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
        };
        SingleEditField.prototype.OnCreate = function () {
            if (this.deleted) {
                return;
            }
            _super.prototype.OnCreate.call(this);
            var that = this;
            //default any inputs if nothing selected?
            if (that.settings.defaultToFirstIfNoneSelected) {
                if (that.fieldType === possibleFieldTypes.select) {
                    var selected = that.targetElement.find("option:selected");
                    if (selected.length === 0) {
                        var first = that.targetElement.find("option:first-child");
                        first.prop("selected", true);
                    }
                }
                else if (that.fieldType === possibleFieldTypes.radio) {
                    var selected = that.targetElement.find("input[type='radio']:selected");
                    if (selected.length === 0) {
                        var first = that.targetElement.find("input[type='radio']:first-child");
                        first.prop("checked", true);
                    }
                }
                else if (that.fieldType === possibleFieldTypes.multiselect) {
                    //possible to select nothing, so allow this
                }
            }
            //add new html
            that.widgetRoot = jQueryModule('<span class="widgetRoot singleEditFieldContainer"></span>');
            var saveButtonHtml = '<i class="' + that.settings.saveIcon + ' widgetButton addTooltip saveButton" aria-hidden="true" title="' + that.settings.defaultSaveButtonTitle + '"></i>';
            that.saveButton = jQueryModule(saveButtonHtml);
            var editButtonHtml = '<i class="' + that.settings.editIcon + ' widgetButton addTooltip editButton" aria-hidden="true" title="' + that.settings.defaultEditButtonTitle + '"></i>';
            that.editButton = jQueryModule(editButtonHtml);
            if (that.settings.showCancelButton) {
                var cancelButtonHtml = '<i class="' + that.settings.cancelIcon + ' widgetButton addTooltip cancelButton" aria-hidden="true" title="' + that.settings.defaultCancelButtonTitle + '"></i>';
                that.cancelButton = jQueryModule(cancelButtonHtml);
            }
            var labelHtml = that.settings.valueLabelFunc.apply(that);
            that.valueLabel = jQueryModule(labelHtml);
            //update the label text
            var val = that.GetInputValueForLabel();
            that.valueLabel.empty().append(val);
            that.valueLabel.appendTo(that.widgetRoot);
            //insert the "widget" elements after the target
            //then move the target inside the "widget" element root
            that.widgetRoot.insertAfter(that.elementToHideAndShow);
            that.elementToHideAndShow.appendTo(that.widgetRoot);
            var applyWidthLimit = false;
            if (that.fieldType === possibleFieldTypes.text) { //a text input based field
                if (that.dataType === possibleDataTypes.text) { //actually only text
                    applyWidthLimit = true;
                }
            }
            else {
                applyWidthLimit = true;
            }
            if (applyWidthLimit) {
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
                var loaderHtml = '<span class="' + that.settings.loaderClass + 'Container"><div class="' + that.settings.loaderClass + '"></div></span>';
                that.loader = jQueryModule(loaderHtml);
                if (that.settings.loaderDestination !== '') {
                    var trg = jQueryModule(that.settings.loaderDestination);
                    if (trg.length > 0) {
                        that.loader.appendTo(trg);
                    }
                    else {
                        console.warn("The loader destination of \"" + that.settings.loaderDestination + "\" was not found.");
                    }
                }
                else {
                    that.loader.appendTo(that.widgetRoot);
                }
            }
            var successIconHtml = '<i class="statusIcon greenIcon fa fa-check-circle addTooltip" aria-hidden="true" title="Saving was successful"></i>';
            that.successIcon = jQueryModule(successIconHtml);
            var errorIconHtml = '<i class="statusIcon redIcon fa fa-times-circle addTooltip" aria-hidden="true" title="There was an error saving"></i>';
            that.errorIcon = jQueryModule(errorIconHtml);
            that.successIcon.appendTo(that.widgetRoot);
            that.errorIcon.appendTo(that.widgetRoot);
            that.targetElement.hide();
            that.elementToHideAndShow.hide();
            that.HideLoader();
            that.HideSaveButton();
            that.HideCustomForm();
            if (that.settings.showCancelButton) {
                that.cancelButton.hide(); //conditional, because the cancel button would be null otherwise
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
        };
        SingleEditField.prototype.AttachHandlers = function () {
            if (this.deleted) {
                return;
            }
            _super.prototype.AttachHandlers.call(this);
            var that = this;
            that.editButton.on("click", function () {
                that.BeginEdit();
            });
            that.saveButton.on("click", function () {
                if (!that.settings.allowSaveFunc.apply(that)) {
                    return;
                }
                var $this = jQueryModule(this);
                if ($this.hasClass("disabled")) {
                    return;
                }
                //get value from input
                var valueToSave = that.GetInputValue();
                if (!that.settings.validateBeforeSave.apply(that, [valueToSave, that.widgetRoot])) {
                    return;
                }
                that.DisableUserInteraction();
                that.ShowLoader();
                if (that.settings.showCancelButton) {
                    Helper_1.Helper.SetAsDisabled(that.cancelButton);
                }
                var saveCompletedFunc = function (savedVal, saveSuccess, showNotification) {
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
                        }
                        else {
                            that.ShowSaveFailNotification();
                        }
                    }
                    if (that.settings.showCancelButton) {
                        Helper_1.Helper.RemoveDisabled(that.cancelButton);
                    }
                };
                try {
                    that.settings.saveFieldFunc.apply(that, [valueToSave, function (valueSaved, success, showNotification) {
                            if (success === void 0) { success = false; }
                            if (showNotification === void 0) { showNotification = false; }
                            if (success) {
                                var val = that.GetInputValueForLabel();
                                that.valueLabel.empty().append(val);
                            }
                            saveCompletedFunc(valueSaved, success, showNotification);
                        }]);
                }
                catch (ex) {
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
                var $this = jQueryModule(this);
                // let the browser set focus on the newly clicked elem before check
                setTimeout(function () {
                    var focusedChildren = $this.find(':focus');
                    var hoverChildren = $this.find(':hover');
                    var activeChildren = $this.find(':hover');
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
        ;
        SingleEditField.prototype.RemoveHandlers = function () {
            if (this.deleted) {
                return;
            }
            _super.prototype.RemoveHandlers.call(this);
            this.editButton.off();
            this.saveButton.off();
            if (this.settings.showCancelButton) {
                this.saveButton.off();
            }
        };
        SingleEditField.prototype.SaveElementState = function () {
            if (this.deleted) {
                return;
            }
            _super.prototype.SaveElementState.call(this);
            //store things we will modify about the element, as to restore it later
            //this.originalElementState["var"] = this.targetElement.prop
        };
        SingleEditField.prototype.RestoreElementState = function () {
            if (this.deleted) {
                return;
            }
            _super.prototype.RestoreElementState.call(this);
            //restore things we modified, from the old element state
        };
        SingleEditField.prototype.SetValue = function (newValue, updateLabel) {
            if (this.deleted) {
                return;
            }
            if (this.fieldType === possibleFieldTypes.checkbox) {
                var checkboxInput = this.targetElement.find("input[type='checkbox']");
                if ((newValue === 'checked') || (newValue === 'true') || ((typeof newValue === 'boolean') && (newValue))) {
                    checkboxInput.prop('checked', true);
                }
                else {
                    checkboxInput.prop('checked', false);
                }
            }
            else if (this.fieldType === possibleFieldTypes.radio) {
                var checkedRadio = this.targetElement.find("input[type='radio'][value='" + newValue + "']");
                if (typeof checkedRadio !== 'undefined') {
                    this.targetElement.find("input[type='radio']").prop('checked', false); //reset all checkboxes
                    if ((newValue === 'checked') || (newValue === 'true') || ((typeof newValue === 'boolean') && (newValue))) {
                        checkedRadio.prop('checked', true);
                    }
                    else {
                        checkedRadio.prop('checked', false);
                    }
                }
            }
            else if (this.fieldType === possibleFieldTypes.select) {
                var selectedOption = this.targetElement.find("option[value='" + newValue + "']");
                if (selectedOption.length > 0) {
                    this.targetElement.val(newValue);
                }
            }
            else if (this.fieldType === possibleFieldTypes.multiselect) {
                if (newValue.length > 0) {
                    this.targetElement.find("option:selected").prop("selected", false);
                    this.targetElement.selectpicker('deselectAll');
                    for (var i = 0; i < newValue.length; i++) {
                        var optionToSelect = this.targetElement.find("option[value='" + newValue[i] + "']");
                        if (optionToSelect.length > 0) {
                            //value is a valid option
                            optionToSelect.prop('selected', true);
                        }
                    } //for loop over passed values
                    this.targetElement.selectpicker('select', newValue);
                } //value isn't a valid or non-empty list
            }
            else {
                //assume as text/number (already in filteredVal)
                this.targetElement.val(newValue);
            }
            if (updateLabel) {
                this._updateLabel(newValue);
            }
        };
        SingleEditField.prototype._updateLabel = function (value) {
            if (this.deleted) {
                return;
            }
            var filteredVal = this.settings.valueFilterForLabel.apply(this, [value]);
            this.valueLabel.empty().append(filteredVal);
        };
        SingleEditField.prototype.ShowLoader = function () {
            if (this.deleted) {
                return;
            }
            if (this.settings.showLoader && this.loader !== null) {
                this.loader.show();
            }
        };
        SingleEditField.prototype.HideLoader = function () {
            if (this.deleted) {
                return;
            }
            if (this.settings.showLoader && this.loader !== null) {
                this.loader.hide();
            }
        };
        SingleEditField.prototype.GetInputValue = function () {
            if (this.deleted) {
                return;
            }
            var value = null;
            if (this.fieldType === possibleFieldTypes.radio) {
                var checkedRadio = this.targetElement.find("input[type='radio']:checked");
                value = checkedRadio.val();
            }
            else if (this.fieldType === possibleFieldTypes.checkbox) {
                value = this.targetElement.find("input[type='checkbox']:checked");
                if (value.length > 0) {
                    value = 'checked';
                }
                else {
                    value = 'unchecked';
                }
            }
            else if (this.fieldType === possibleFieldTypes.multiselect) {
                var selectedOptions = this.targetElement.find("option:selected");
                value = [];
                if (selectedOptions.length > 0) {
                    selectedOptions.each(function (idx, option) {
                        value.push(jQueryModule(option).val());
                    });
                }
            }
            else {
                //just get the val
                value = this.targetElement.val();
            }
            if (value === null) {
                value = -1;
            }
            return value;
        };
        SingleEditField.prototype.GetInputValueForLabel = function () {
            if (this.deleted) {
                return;
            }
            var val = this.GetInputValue();
            return this.settings.valueFilterForLabel.apply(this, [val]);
        };
        SingleEditField.prototype.ShowSaveSuccessNotification = function (notificationInfo) {
            if (notificationInfo === void 0) { notificationInfo = null; }
            if (this.deleted) {
                return;
            }
            var that = this;
            this.successIcon.show();
            setTimeout(function () {
                that.successIcon.fadeOut(500);
            }, that.settings.statusIconShowTimeSecs * 1000);
            if (this.settings.showNotifications && Common_Widgets_1.CommonWidgets.GlobalWidgetSettings.Notifications.ShowNotifications) {
                var msg = "";
                var title = "";
                if ((typeof notificationInfo === 'undefined') || (notificationInfo === null) || (typeof notificationInfo !== 'object')) {
                    msg = " was saved.";
                    title = "Saved!";
                    if (this.fieldName !== null) {
                        msg = this.fieldName + msg;
                    }
                    else {
                        msg = "The field" + msg;
                    }
                }
                else {
                    msg = notificationInfo.message;
                    title = notificationInfo.title;
                }
                Helper_1.Helper.ShowWidgetNotification(title, msg, "success");
            }
        };
        SingleEditField.prototype.ShowSaveFailNotification = function (notificationInfo) {
            if (notificationInfo === void 0) { notificationInfo = null; }
            if (this.deleted) {
                return;
            }
            this.errorIcon.show();
            if (this.settings.showNotifications && Common_Widgets_1.CommonWidgets.GlobalWidgetSettings.Notifications.ShowNotifications) {
                var msg = "";
                var title = "";
                if ((notificationInfo === null) || (typeof notificationInfo !== 'object')) {
                    msg = " was not saved.";
                    title = "Not Saved!";
                    if (this.fieldName !== null) {
                        msg = this.fieldName + msg;
                    }
                    else {
                        msg = "The field" + msg;
                    }
                }
                else {
                    msg = notificationInfo.message;
                    title = notificationInfo.title;
                }
                Helper_1.Helper.ShowWidgetNotification(title, msg, "danger");
            }
        };
        //the method to use to modify the save button label after initialized (and then can be set back to the default)
        SingleEditField.prototype.SetSaveButtonTitle = function (text) {
            if (this.deleted) {
                return;
            }
            this.saveButton.prop('title', text);
            if (typeof jQueryModule.tooltipster !== 'undefined' && this.settings.showTooltips && Common_Widgets_1.CommonWidgets.GlobalWidgetSettings.Tooltips.ShowTooltips) {
                this.saveButton.tooltipster('content', text);
            }
        };
        //the method to use to modify the edit button label after initialized (and then can be set back to the default)
        SingleEditField.prototype.SetEditButtonTitle = function (text) {
            if (this.deleted) {
                return;
            }
            this.editButton.prop('title', text);
            if (typeof jQueryModule.tooltipster !== 'undefined' && this.settings.showTooltips && Common_Widgets_1.CommonWidgets.GlobalWidgetSettings.Tooltips.ShowTooltips) {
                this.editButton.tooltipster('content', text);
            }
        };
        //restores the save button title attributes (used for tooltips) to its default
        SingleEditField.prototype.RevertSaveButtonTitle = function () {
            if (this.deleted) {
                return;
            }
            this.saveButton.prop('title', this.settings.defaultSaveButtonTitle);
            if (typeof jQueryModule.tooltipster !== 'undefined') {
                this.saveButton.tooltipster('content', this.settings.defaultSaveButtonTitle);
            }
        };
        //restores the edit button title attributes (used for tooltips) to its default
        SingleEditField.prototype.RevertEditButtonTitle = function () {
            if (this.deleted) {
                return;
            }
            this.editButton.prop('title', this.settings.defaultEditButtonTitle);
            if (typeof jQueryModule.tooltipster !== 'undefined') {
                this.editButton.tooltipster('content', this.settings.defaultEditButtonTitle);
            }
        };
        //used to fetch if this widget is in "edit" mode
        SingleEditField.prototype.IsEditing = function () {
            if (this.deleted) {
                return false;
            }
            return this.targetElement.prop("editing");
        };
        //the method to call when wanting to destroy (dispose) of tooltip functionality (disable tooltips if you want to show/hide them)
        SingleEditField.prototype.DestroyTooltips = function () {
            if (this.deleted) {
                return false;
            }
            if (typeof jQueryModule.tooltipster !== 'undefined') {
                var tooltips = this.widgetRoot.find(".addTooltip").tooltipster("destroy");
                return true;
            }
            else {
                if (GlobalWidgetSettings_1.GlobalWidgetSettings.dependencyWarningMessageDisplay) {
                    console.warn("The jQuery plugin 'Tooltipster' was not found. Please include it to destroy tool-tips for the 'SingleEditField' widget.");
                }
                return false;
            }
        };
        //the method to call to temporarily disable tooltips
        SingleEditField.prototype.DisableTooltips = function () {
            if (this.deleted) {
                return false;
            }
            if (typeof jQueryModule.tooltipster !== 'undefined') {
                this.widgetRoot.find(".addTooltip").tooltipster("disable");
                return true;
            }
            else {
                if (GlobalWidgetSettings_1.GlobalWidgetSettings.dependencyWarningMessageDisplay) {
                    console.warn("The jQuery plugin 'Tooltipster' was not found. Please include it to disable tool-tips for the 'SingleEditField' widget.");
                }
                return false;
            }
        };
        //the method to call to initialize / enable tooltips
        SingleEditField.prototype.EnableTooltips = function () {
            if (this.deleted) {
                return false;
            }
            if (typeof jQueryModule.tooltipster !== 'undefined') {
                if (this.settings.showTooltips && Common_Widgets_1.CommonWidgets.GlobalWidgetSettings.Tooltips.ShowTooltips) {
                    var tooltips = this.widgetRoot.find(".addTooltip").tooltipster();
                    tooltips.tooltipster("enable");
                    return true;
                }
                else {
                    console.log("Tooltips for the widget 'SingleEditField' are disabled.");
                }
            }
            else {
                if (GlobalWidgetSettings_1.GlobalWidgetSettings.dependencyWarningMessageDisplay) {
                    console.warn("The jQuery plugin 'Tooltipster' was not found. Please include it to enable tool-tips for the 'SingleEditField' widget.");
                }
            }
        };
        //use this method to ENTER edit mode
        SingleEditField.prototype.BeginEdit = function () {
            if (this.deleted) {
                return;
            }
            if (!this.settings.allowEditFunc.apply(this)) {
                return;
            }
            this.valueLabel.hide();
            if (!TypeChecker_1.TypeChecker.isBooleanOrFunctionTrue(this.settings.showCustomFormInsteadOfInput)) {
                this.elementToHideAndShow.show();
                this.ShowSaveButton();
            }
            if (TypeChecker_1.TypeChecker.isBooleanOrFunctionTrue(this.settings.showCustomForm)) {
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
            Helper_1.Helper.ExecuteIfDefined(this.settings.beginEditCallback, this);
        };
        //use this method to EXIT edit mode
        SingleEditField.prototype.EndEdit = function () {
            if (this.deleted) {
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
            Helper_1.Helper.ExecuteIfDefined(this.settings.endEditCallback, this);
        };
        SingleEditField.prototype.DisableUserInteraction = function () {
            if (this.deleted) {
                return;
            }
            Helper_1.Helper.SetAsReadOnly(this.targetElement);
            Helper_1.Helper.SetAsDisabled(this.targetElement);
            Helper_1.Helper.SetAsReadOnly(this.saveButton);
            Helper_1.Helper.SetAsDisabled(this.saveButton);
            if (this.settings.showCancelButton) {
                Helper_1.Helper.SetAsDisabled(this.cancelButton);
            }
        };
        ;
        SingleEditField.prototype.EnableUserInteraction = function () {
            if (this.deleted) {
                return;
            }
            Helper_1.Helper.RemoveReadOnly(this.targetElement);
            Helper_1.Helper.RemoveDisabled(this.targetElement);
            Helper_1.Helper.RemoveReadOnly(this.saveButton);
            Helper_1.Helper.RemoveDisabled(this.saveButton);
            if (this.settings.showCancelButton) {
                Helper_1.Helper.RemoveDisabled(this.cancelButton);
            }
        };
        SingleEditField.prototype.ResetAutoSaving = function () {
            if (this.deleted) {
                return;
            }
            var that = this;
            that.settings.autoSaveAfterChange = true;
            var dataInstance = Helper_1.Helper.GetDataIfPresent(that.targetElement, that.settings.autoSaveTimerDataKey, TimedAction_1.TimedAction);
            if (dataInstance === null) {
                dataInstance = new TimedAction_1.TimedAction(function () {
                    that.saveButton.click();
                }, { maxTime: that.settings.autoSaveTime });
                that.targetElement.data(that.settings.autoSaveTimerDataKey, dataInstance);
            }
            dataInstance.Reset();
        };
        SingleEditField.prototype.DisableAutoSaving = function () {
            if (this.deleted) {
                return;
            }
            var that = this;
            that.settings.autoSaveAfterChange = false;
            var dataInstance = Helper_1.Helper.GetDataIfPresent(that.targetElement, that.settings.autoSaveTimerDataKey, TimedAction_1.TimedAction);
            if (dataInstance !== null) {
                dataInstance.Stop();
            }
        };
        SingleEditField.prototype.HideSaveButton = function () {
            if (this.deleted) {
                return;
            }
            this.saveButton.hide();
        };
        SingleEditField.prototype.ShowSaveButton = function () {
            if (this.deleted) {
                return;
            }
            this.saveButton.show();
        };
        SingleEditField.prototype.HideCustomForm = function () {
            if (this.deleted) {
                return;
            }
            this.customForm.hide();
        };
        SingleEditField.prototype.ShowCustomForm = function () {
            if (this.deleted) {
                return;
            }
            this.customForm.show();
        };
        SingleEditField.widgetDataName = "SingleEditField_instance";
        SingleEditField.pluginName = "SingleEditField";
        SingleEditField.defaultOptions = {
            saveFieldFunc: function (valueToSave, completeFunction) { console.log("The value \"" + valueToSave + "\" was entered."); completeFunction(valueToSave, true, false); },
            allowEditFunc: function () { return true; },
            allowSaveFunc: function () { return true; },
            unfocusCallback: function () { console.log('Unfocus'); },
            validateBeforeSave: function (val, widgetRoot) { console.log("The value \"" + val + "\" is valid."); return true; },
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
            valueFilterForLabel: function (val) {
                var that = this;
                var filteredVal = val;
                if (that.fieldType === possibleFieldTypes.checkbox) {
                    if (val === 'checked') {
                        filteredVal = that.settings.checkedValueDisplay();
                    }
                    else {
                        filteredVal = that.settings.uncheckedValueDisplay();
                    }
                }
                else if (that.fieldType === possibleFieldTypes.radio) {
                    var checkedRadio = that.targetElement.find("input[type='radio'][value='" + val + "']");
                    if (checkedRadio.data().hasOwnProperty("valueLabel")) {
                        filteredVal = checkedRadio.data("value-label");
                    }
                    else {
                        filteredVal = checkedRadio.val();
                    }
                }
                else if (that.fieldType === possibleFieldTypes.select) {
                    var selectedOption = that.targetElement.find("option[value='" + val + "']");
                    if (selectedOption.length > 0) {
                        if (selectedOption.data().hasOwnProperty("valueLabel")) {
                            filteredVal = selectedOption.data("value-label");
                        }
                        else {
                            filteredVal = selectedOption.text();
                        }
                    }
                    else {
                        filteredVal = that.settings.noSelectedValueDisplay;
                    }
                }
                else if (that.fieldType === possibleFieldTypes.multiselect) {
                    if (val.length > 0) {
                        filteredVal = "";
                        for (var i = 0; i < val.length; i++) {
                            var selectedOption = that.targetElement.find("option[value='" + val[i] + "']");
                            if (i > 0) {
                                filteredVal += ", "; //add comma to separate elements
                            }
                            if (selectedOption.data().hasOwnProperty("valueLabel")) {
                                filteredVal += selectedOption.data("value-label");
                            }
                            else {
                                filteredVal += selectedOption.text();
                            }
                        }
                    }
                    else {
                        filteredVal = that.settings.noSelectedValueDisplay;
                    }
                }
                else {
                    //assume as text/number (already in filteredVal)
                    var emptyInputValue = (typeof filteredVal === 'undefined') || (filteredVal === null) || ((typeof filteredVal === 'string') && (filteredVal.trim() === ""));
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
            beginEditCallback: function (widget) { },
            endEditCallback: function (widget) { }
        };
        return SingleEditField;
    }(WidgetBase_1.WidgetBase));
    exports.SingleEditField = SingleEditField;
});
//# sourceMappingURL=SingleEditField.js.map
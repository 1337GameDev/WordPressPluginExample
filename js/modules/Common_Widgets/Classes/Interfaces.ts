import {WidgetBase} from "./WidgetBase";
import {DynamicObject} from "./DynamicObject";
import {SingleEditField} from "./SingleEditField";
import {ChoiceButton} from "./ChoiceButton";
import {FileDropArea} from "Common_Widgets/Classes/FileDropArea";

export interface IGlobalTooltipSettings {
    ShowTooltips: boolean;
}

export interface INotificationPlacementOptions {
    from: string;
    align: string;
}

export interface INotificationAnimateOptions {
    enter: string;
    exit: string;
}

export interface IGlobalNotificationSettings {
    ShowNotifications: boolean;
    placement: INotificationPlacementOptions;
    animate: INotificationAnimateOptions;
    type: string;
    delay: number;
    mouse_over: string;
    template: string;
}

export interface ISingleEditFieldOptions {
    //the function to use when saving is to be done for the value of this field. This function calls the "complete" function when saving is done.
    saveFieldFunc: (valToSave:any, completeFunc:(valueSaved:any,success:boolean,showNotification:boolean)=>void)=>void;
    //an extra function to be called when the edit mode is started
    beginEditCallback: (current_widget:WidgetBase)=>void;
    //an extra function to be called when the edit mode is ended
    endEditCallback: (current_widget:WidgetBase)=>void;
    //a function to determine if edit is to be allowed (returns a boolean that is checked when this widget tries to transition to "edit mode")
    allowEditFunc: ()=>boolean;
    //a function to determine if saving should be initiated (function returns a boolean that is checked when the save button of this widget is clicked)
    allowSaveFunc: ()=>boolean;

    unfocusCallback: ()=>void;

    validateBeforeSave: (val:any, widgetRoot:JQuery)=>boolean;

    //the edit button icon class to use
    editIcon: string;
    //the default text for the save button, can be overridden to change the save button text
    defaultSaveButtonTitle: string;
    //the save button icon class to use
    saveIcon: string;
    //the default edit button text (can be overridden to change the edit button text)
    defaultEditButtonTitle: string;
    //whether to show the cancel button
    showCancelButton: boolean;
    //the save button icon class to use
    cancelIcon: string;
    //the default edit button text (can be overridden to change the edit button text)
    defaultCancelButtonTitle: string;
    //the class to use for the loader element (and parent element -- use for styling custom loaders)
    loaderClass: string;
    //whether to show the loader when saving
    showLoader: boolean;
    //whether to show notifications when saving, or when errors happen
    showNotifications: boolean;
    //whether to attach / show tooltips for this widget
    showTooltips: boolean;
    //currently set as an element in the widgetRoot element, but cna be set to a custom selector (or multiple)
    loaderDestination: string;
    //defaults radio/selects to the first entry if nothing is selected
    defaultToFirstIfNoneSelected: boolean;
    //the time (in seconds) to show the "success" or "error" icons when a save has been completed
    statusIconShowTimeSecs: number;
    //The value to display for a checked checkbox
    checkedValueDisplay: ()=>string;
    //the value to display for an unchecked checkbox
    uncheckedValueDisplay: ()=>string;
    //what to display when a value is not selected for a select or multiselect (remember this won't be handled if you default to the first value if nothing is selected)
    noSelectedValueDisplay: string;
    //whether to show a special message when the input is empty (text)
    displayPlaceholderForEmptyText: boolean;
    //what to display when a text value is not present/empty
    emptyTextValueDisplay: string;
    //a function used to generate the label to display the widgets current value when saved/not being edited
    valueLabelFunc: ()=>string;
    //a filter for the value to display on a label (such as translating selected option from a database ID to a name of an option)
    valueFilterForLabel: (valToFilter:any)=>any;
    autoSaveTime: number;
    autoSaveAfterChange: boolean;
    autoSaveTimerDataKey: string;
    //indicates whether the custom form (if found denoted by the "customform" css class) should be shown along with the normal input
    //can be a function as well
    showCustomForm: boolean;
    //used to indicate if the custom form should be shown, instead of the normal input+save elements (such as conditional editing, or handling special cases / user rights)
    showCustomFormInsteadOfInput: boolean;
}

export interface IFileDropAreaOptions {
    onSelectFile: (files:FileList, fileDropArea:FileDropArea)=>void;
    addDroppedFilesToInputElement: boolean;
}

export interface CommonWidgetsJquerySignature {
    (): any;
    SingleEditField(options: DynamicObject): SingleEditField | SingleEditField[] | JQuery;
    ChoiceButton(options: DynamicObject): ChoiceButton | ChoiceButton[] | JQuery;
    SetAsReadOnly();
    RemoveReadOnly();
    SetAsDisabled();
    RemoveDisabled();
    removeClassesWithPrefix(prefix:string);
    setDependencyWarningMessageDisplay(showMessages:boolean);
    custom_multiselect(options:DynamicObject);
}
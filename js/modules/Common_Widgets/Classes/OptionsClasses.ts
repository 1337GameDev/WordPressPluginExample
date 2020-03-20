import * as Interfaces from './Interfaces';
import {WidgetBase} from "./WidgetBase";
import {FileDropArea} from "./FileDropArea";

export class GlobalTooltipSettings implements Interfaces.IGlobalTooltipSettings {
    public static getDefaults():GlobalTooltipSettings {
        return new GlobalTooltipSettings(
            true
        );
    }

    ShowTooltips: boolean;
    /**
     * Create an options class.
     * @param ShowTooltips - Whether to show tooltips or not
     */
    constructor(ShowTooltips: boolean = GlobalTooltipSettings.getDefaults().ShowTooltips) {
        this.ShowTooltips = ShowTooltips;
    }
}

export class NotificationPlacementOptions implements Interfaces.INotificationPlacementOptions {
    public static getDefaults():NotificationPlacementOptions {
        return new NotificationPlacementOptions(
            "top",
            "right"
        );
    }

    from: string;
    align: string;

    /**
     * Create an options class.
     * @param from - Which direction should notifications come from
     * @param align - How to align the notifications
     */
    constructor(from: string = NotificationPlacementOptions.getDefaults().from, align: string = NotificationPlacementOptions.getDefaults().align) {
        this.from = from;
        this.align = align;
    }
}

export class NotificationAnimateOptions implements Interfaces.INotificationAnimateOptions {
    public static getDefaults():NotificationAnimateOptions {
        return new NotificationAnimateOptions(
            "animated fadeInDown",
            "animated fadeOutUp"
        );
    }

    enter: string;
    exit: string;

    /**
     * Create an options class.
     * @param enter - What animation should be used for the notification entering view
     * @param exit - What animation should be used for the notification exiting view
     */
    constructor(enter: string = NotificationAnimateOptions.getDefaults().enter, exit: string = NotificationAnimateOptions.getDefaults().exit) {
        this.enter = enter;
        this.exit = exit;
    }
}

export class GlobalNotificationSettings implements Interfaces.IGlobalNotificationSettings {
    public static getDefaults():GlobalNotificationSettings {
        return new GlobalNotificationSettings(
            true,
            NotificationPlacementOptions.getDefaults(),
            NotificationAnimateOptions.getDefaults(),
            'pastel-info',
            3000,
            'pause',
            '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0}" role="alert">' +
            '<button type="button" aria-hidden="true" class="close" data-notify="dismiss"><i class="fa fa-times" aria-hidden="true"></i></button>' +
            '<span data-notify="icon"></span>' +
            '<span data-notify="title">{1}</span>' +
            '<span data-notify="message">{2}</span>' +
            '</div>'
        );
    }

    ShowNotifications: boolean;
    placement: NotificationPlacementOptions;
    animate: NotificationAnimateOptions;
    type: string;
    delay: number;
    mouse_over: string;
    template: string;

    /**
     * Create an options class.
     * @param ShowNotifications - Whether to show notifications or not.
     * @param placement - The placement options for a notification.
     * @param animate - The animation options for a notification.
     * @param type - the notification style type.
     * @param delay - The delay to use for notification animations.
     * @param mouse_over - What do do when a user mouse over's the notification.
     * @param template - The template string to use for the notification.
     */
    constructor(
        ShowNotifications: boolean = GlobalNotificationSettings.getDefaults().ShowNotifications,
        placement: NotificationPlacementOptions = GlobalNotificationSettings.getDefaults().placement,
        animate: NotificationAnimateOptions = GlobalNotificationSettings.getDefaults().animate,
        type: string = GlobalNotificationSettings.getDefaults().type,
        delay: number = GlobalNotificationSettings.getDefaults().delay,
        mouse_over: string = GlobalNotificationSettings.getDefaults().mouse_over,
        template: string = GlobalNotificationSettings.getDefaults().template
    ) {
        this.ShowNotifications = ShowNotifications;
        this.placement = placement;
        this.animate = animate;
        this.type = type;
        this.delay = delay;
        this.mouse_over = mouse_over;
        this.template = template;
    }
}

export class SingleEditFieldOptions implements Interfaces.ISingleEditFieldOptions {
    saveFieldFunc: (valToSave:any, completeFunc:(valueSaved:any,success:boolean,showNotification:boolean)=>void)=>void;
    beginEditCallback: (current_widget:WidgetBase)=>void;
    endEditCallback: (current_widget:WidgetBase)=>void;
    allowEditFunc: ()=>boolean;
    allowSaveFunc: ()=>boolean;
    unfocusCallback: ()=>void;
    validateBeforeSave: (val:any, widgetRoot:JQuery)=>boolean;
    editIcon: string;
    defaultSaveButtonTitle: string;
    saveIcon: string;
    defaultEditButtonTitle: string;
    showCancelButton: boolean;
    cancelIcon: string;
    defaultCancelButtonTitle: string;
    loaderClass: string;
    showLoader: boolean;
    showNotifications: boolean;
    showTooltips: boolean;
    loaderDestination: string;
    defaultToFirstIfNoneSelected: boolean;
    statusIconShowTimeSecs: number;
    checkedValueDisplay: ()=>string;
    uncheckedValueDisplay: ()=>string;
    noSelectedValueDisplay: string;
    displayPlaceholderForEmptyText: boolean;
    emptyTextValueDisplay: string;
    valueLabelFunc: ()=>string;
    valueFilterForLabel: (valToFilter:any)=>any;
    autoSaveTime: number;
    autoSaveAfterChange: boolean;
    autoSaveTimerDataKey: string;
    showCustomForm: boolean;
    showCustomFormInsteadOfInput: boolean;

}

export class FileDropAreaOptions implements Interfaces.IFileDropAreaOptions {
    onSelectFile: (files:FileList, fileDropArea:FileDropArea)=>void;
    addDroppedFilesToInputElement: boolean;
}
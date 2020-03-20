(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var GlobalTooltipSettings = /** @class */ (function () {
        /**
         * Create an options class.
         * @param ShowTooltips - Whether to show tooltips or not
         */
        function GlobalTooltipSettings(ShowTooltips) {
            if (ShowTooltips === void 0) { ShowTooltips = GlobalTooltipSettings.getDefaults().ShowTooltips; }
            this.ShowTooltips = ShowTooltips;
        }
        GlobalTooltipSettings.getDefaults = function () {
            return new GlobalTooltipSettings(true);
        };
        return GlobalTooltipSettings;
    }());
    exports.GlobalTooltipSettings = GlobalTooltipSettings;
    var NotificationPlacementOptions = /** @class */ (function () {
        /**
         * Create an options class.
         * @param from - Which direction should notifications come from
         * @param align - How to align the notifications
         */
        function NotificationPlacementOptions(from, align) {
            if (from === void 0) { from = NotificationPlacementOptions.getDefaults().from; }
            if (align === void 0) { align = NotificationPlacementOptions.getDefaults().align; }
            this.from = from;
            this.align = align;
        }
        NotificationPlacementOptions.getDefaults = function () {
            return new NotificationPlacementOptions("top", "right");
        };
        return NotificationPlacementOptions;
    }());
    exports.NotificationPlacementOptions = NotificationPlacementOptions;
    var NotificationAnimateOptions = /** @class */ (function () {
        /**
         * Create an options class.
         * @param enter - What animation should be used for the notification entering view
         * @param exit - What animation should be used for the notification exiting view
         */
        function NotificationAnimateOptions(enter, exit) {
            if (enter === void 0) { enter = NotificationAnimateOptions.getDefaults().enter; }
            if (exit === void 0) { exit = NotificationAnimateOptions.getDefaults().exit; }
            this.enter = enter;
            this.exit = exit;
        }
        NotificationAnimateOptions.getDefaults = function () {
            return new NotificationAnimateOptions("animated fadeInDown", "animated fadeOutUp");
        };
        return NotificationAnimateOptions;
    }());
    exports.NotificationAnimateOptions = NotificationAnimateOptions;
    var GlobalNotificationSettings = /** @class */ (function () {
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
        function GlobalNotificationSettings(ShowNotifications, placement, animate, type, delay, mouse_over, template) {
            if (ShowNotifications === void 0) { ShowNotifications = GlobalNotificationSettings.getDefaults().ShowNotifications; }
            if (placement === void 0) { placement = GlobalNotificationSettings.getDefaults().placement; }
            if (animate === void 0) { animate = GlobalNotificationSettings.getDefaults().animate; }
            if (type === void 0) { type = GlobalNotificationSettings.getDefaults().type; }
            if (delay === void 0) { delay = GlobalNotificationSettings.getDefaults().delay; }
            if (mouse_over === void 0) { mouse_over = GlobalNotificationSettings.getDefaults().mouse_over; }
            if (template === void 0) { template = GlobalNotificationSettings.getDefaults().template; }
            this.ShowNotifications = ShowNotifications;
            this.placement = placement;
            this.animate = animate;
            this.type = type;
            this.delay = delay;
            this.mouse_over = mouse_over;
            this.template = template;
        }
        GlobalNotificationSettings.getDefaults = function () {
            return new GlobalNotificationSettings(true, NotificationPlacementOptions.getDefaults(), NotificationAnimateOptions.getDefaults(), 'pastel-info', 3000, 'pause', '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0}" role="alert">' +
                '<button type="button" aria-hidden="true" class="close" data-notify="dismiss"><i class="fa fa-times" aria-hidden="true"></i></button>' +
                '<span data-notify="icon"></span>' +
                '<span data-notify="title">{1}</span>' +
                '<span data-notify="message">{2}</span>' +
                '</div>');
        };
        return GlobalNotificationSettings;
    }());
    exports.GlobalNotificationSettings = GlobalNotificationSettings;
    var SingleEditFieldOptions = /** @class */ (function () {
        function SingleEditFieldOptions() {
        }
        return SingleEditFieldOptions;
    }());
    exports.SingleEditFieldOptions = SingleEditFieldOptions;
    var FileDropAreaOptions = /** @class */ (function () {
        function FileDropAreaOptions() {
        }
        return FileDropAreaOptions;
    }());
    exports.FileDropAreaOptions = FileDropAreaOptions;
});
//# sourceMappingURL=OptionsClasses.js.map
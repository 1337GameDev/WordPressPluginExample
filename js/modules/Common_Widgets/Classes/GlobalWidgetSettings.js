(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./OptionsClasses"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Options = require("./OptionsClasses");
    var GlobalWidgetSettings = /** @class */ (function () {
        function GlobalWidgetSettings(Tooltips, Notifications) {
            if (Tooltips === void 0) { Tooltips = Options.GlobalTooltipSettings.getDefaults(); }
            if (Notifications === void 0) { Notifications = Options.GlobalNotificationSettings.getDefaults(); }
            this.Tooltips = Tooltips;
            this.Notifications = Notifications;
        }
        return GlobalWidgetSettings;
    }());
    exports.GlobalWidgetSettings = GlobalWidgetSettings;
});
//# sourceMappingURL=GlobalWidgetSettings.js.map
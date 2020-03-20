import * as Options from './OptionsClasses';

export class GlobalWidgetSettings {
    public Tooltips:Options.GlobalTooltipSettings;
    public Notifications:Options.GlobalNotificationSettings;
    public static dependencyWarningMessageDisplay: boolean;

    constructor(
        Tooltips:Options.GlobalTooltipSettings = Options.GlobalTooltipSettings.getDefaults(),
        Notifications:Options.GlobalNotificationSettings = Options.GlobalNotificationSettings.getDefaults()
        ) {
        this.Tooltips = Tooltips;
        this.Notifications = Notifications;
    }
}




import * as i18n from 'i18n';
import * as path from 'path';

export interface ILocalizationHelperOptions {
    locales?: string[];
    defaultLocale?: string;
    queryParameter?: string;
    directory?: string;
}

/** Class representing options that LocalizationHelper accepts. */
export class LocalizationHelperOptions implements ILocalizationHelperOptions {
    private static defaults = new LocalizationHelperOptions(
    );

    /** The default options */
    public static getDefaults():LocalizationHelperOptions {
        return LocalizationHelperOptions.defaults;
    }

    /**
     * Create an options class.
     */
    constructor() {
    }
}

export class LocalizationHelper {
    constructor(options?: LocalizationHelperOptions) {
        i18n.configure({
            locales: ['en', 'es'],
            defaultLocale: 'en',
            queryParameter: 'lang',
            directory: path.join('../', 'Localizations')
        });
    }

    /**
     *
     * @returns {string} The current locale code
     */
    public getCurrentLocale() {
        return i18n.getLocale();
    }

    /**
     *
     * @returns string[] The list of available locale codes
     */
    public getLocales() {
        return i18n.getLocales();
    }

    /**
     *
     * @param locale The locale to set. Must be from the list of available locales.
     */
    public setLocale(locale) {
        if (this.getLocales().indexOf(locale) !== -1) {
            i18n.setLocale(locale);
        }
    }

    /**
     *
     * @param string String to translate
     * @param args Extra parameters
     * @returns {string} Translated string
     */
    public translate(string, args = undefined) {
        return i18n.__(string, args);
    }

    /**
     *
     * @param phrase Object to translate
     * @param count The plural number
     * @returns {string} Translated string
     */
    public translatePlurals(phrase, count) {
        return i18n.__n(phrase, count);
    }
}
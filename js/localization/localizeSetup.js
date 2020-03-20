let LocalizeHelper = {
    getSettings: null,
    settings: null,
    loadFileForLanguage: null,
    switchLanguage: null,
    getPreferredLocale:null
};

(function(globals){
    (function($){
        'use strict';
        let GlobalJSData = globals.GlobalJSData || {};
        let htmlRoot = null;

        $(function() {
            htmlRoot = $("body");
            getSettings();
            init(function(){/* Do any initializing stuff here */});
        });

        function getSettings(){
            if(LocalizeHelper.settings === null) {
                let settingsElement = $("#localize_settings");
                if(settingsElement.length === 0) {
                    console.error("Localize settings missing. An element with id of \'localize_settings\' is require for localization.");
                    return null;
                } else {
                    var settingsJSONObj = settingsElement.data("localizationSettings");
                    var priorityList = [];
                    for (var property in settingsJSONObj.locales_preferred) {
                        if (settingsJSONObj.locales_preferred.hasOwnProperty(property)) {
                            priorityList.push({locale:property, priority:settingsJSONObj.locales_preferred[property]})
                        }
                    }
                    priorityList.sort(function(a, b){
                        var pA = parseFloat(a.priority);
                        pA = isNaN(pA) ? 0 : pA;
                        var pB = parseFloat(b.priority);
                        pB = isNaN(pB) ? 0 : pB;

                        return pB - pA;//sort in descending order
                    });

                    settingsJSONObj.locales_preferred = priorityList;
                    LocalizeHelper.settings = settingsJSONObj;
                }
            }
            return LocalizeHelper.settings;
        }
        LocalizeHelper.getSettings = getSettings;

        function init(callback){
            if(LocalizeHelper.settings === null) {
                console.error("Localize settings missing.");
                return;
            }

            var language = LocalizeHelper.settings["preferred_simplified_locale"];

            $.i18n({
                locale: language
            });

            /*
            LocalizeHelper.loadBaseTranslations(language, function(){
                LocalizeHelper.loadFileForLanguage(language, function(){
                    $.i18n().load(LocalizeHelper.settings["preferred_lang_messages"],language).done(function(){
                        htmlRoot.i18n();

                        if((typeof callback !== 'undefined') && (callback !== null)) {
                            callback();
                        }
                    });
                });
            });
            */

            LocalizeHelper.switchLanguage(language, function(){
                $.i18n().load(LocalizeHelper.settings["preferred_lang_messages"],language).done(function(){
                    htmlRoot.i18n();

                    if((typeof callback !== 'undefined') && (callback !== null)) {
                        callback();
                    }
                });
            });
        }
        LocalizeHelper.init = init;

        function loadFileForLanguage(language, callback) {
            if(LocalizeHelper.settings === null) {
                console.error("Localize settings missing.");
                return;
            }

            $.i18n().load(
                GlobalJSData.pluginURL+'/js/localization/i18n/'+LocalizeHelper.settings["page_name"]+"-"+language+'.json',
                language
            ).done(callback);
        }
        LocalizeHelper.loadFileForLanguage = loadFileForLanguage;

        function loadBaseTranslations(language, callback) {
            if(LocalizeHelper.settings === null) {
                console.error("Localize settings missing.");
                return;
            }

            $.i18n().load(
                GlobalJSData.pluginURL+'/js/localization/i18n/base-translations-'+language+'.json',
                language
            ).done(callback);
        }
        LocalizeHelper.loadBaseTranslations = loadBaseTranslations;

        function switchLanguage(language, callback) {
            if(LocalizeHelper.settings === null) {
                console.error("Localize settings missing.");
                return;
            }

            LocalizeHelper.loadBaseTranslations(language, function(){
                if($.inArray(language, LocalizeHelper.settings["available_languages"]) > -1) {
                    loadFileForLanguage(language, function () {
                        $.i18n().locale = language;
                        htmlRoot.i18n();
                        if ((typeof callback !== 'undefined') && (callback !== null)) {
                            callback();
                        }
                    });
                } else {
                    $.i18n().locale = language;
                    htmlRoot.i18n();
                    if(language !== 'en') {
                        console.warn("The language \'" + language + "\' is not available for this page.");
                    }
                }
            });
        }
        LocalizeHelper.switchLanguage = switchLanguage;

        function getPreferredLocale() {
            if(LocalizeHelper.settings === null) {
                console.error("Localize settings missing.");
                return null;
            }

            //get most preferred locale
            return LocalizeHelper.settings.preferred_simplified_locale;
        }
        LocalizeHelper.getPreferredLocale = getPreferredLocale;

    })(jQuery);
})(this);
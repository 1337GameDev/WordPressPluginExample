/// <reference types="jquery" />
/// <reference path="../../../lib/@types/requirejs/index.d.ts" />

/**
 * Loaded on the "testpluginuser" user-side page
 */
requirejs(["jquery", "TestPlugin", "Common_Widgets"],function(jQuery, TestPlugin, CommonWidgetsModule) {
    jQuery(function() {
        init();
        attachEventHandlers();
    });

    function init(){
        let pageCache = jQuery('#initialPageCache').data('initial-page-cache');
        let langsTableContainer = jQuery('#languagesTable');

        let tableHtml = TestPlugin.Utilities.ElementGeneratorHelper.getObjectArrayBootstrap4Table(pageCache['Languages'], 'Language');
        langsTableContainer.empty().append(tableHtml);
    }

    //use this to attach all delegated event handlers
    function attachEventHandlers() {
        let body = jQuery("body");
        body.on("click",'#testAjaxButton', loadSettingsAndPopulateTable);

        //body.on("click",'#filterCategoriesListDialog > .filterCategoryDialogItem > input',);
    }

    /** Ajax Calls **/
    function loadSettingsAndPopulateTable() {
        let settingsTableContainer = jQuery('#settingsTable');
        let settingsTableLoader = jQuery('#settingsTableLoader');

        let button = jQuery('#testAjaxButton');
        button.addClass('pendingAction');
        button.addClass('disabled');
        TestPlugin.Utilities.Helper.disableButton(button);

        TestPlugin.Utilities.Helper.show(settingsTableLoader);

        jQuery.when(getSettings() ).done(function(settingsResponse){
            console.groupCollapsed("User Ajax");
            let settingsData = settingsResponse['result']['results'];
            let tableHtml = TestPlugin.Utilities.ElementGeneratorHelper.getObjectArrayBootstrap4Table(settingsData, 'Setting');
            settingsTableContainer.empty().append(tableHtml);

            console.log('Settings data:',settingsData);
            console.groupEnd();
        }).always(function(){
            button.removeClass('pendingAction');
            button.removeClass('disabled');
            TestPlugin.Utilities.Helper.enableButton(button);

            TestPlugin.Utilities.Helper.hide(settingsTableLoader);
        });
    }

    function getSettings():JQueryPromise<any> {
        let jsonData = {};

        let payload = new TestPlugin.WPAjaxPayload(
            TestPlugin.PluginData.ajaxEndpoints.user.getSettings,
            JSON.stringify(jsonData)
        ).prepare();

        return jQuery.ajax({
            data: payload
        });
    }
});

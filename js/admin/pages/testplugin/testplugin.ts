/// <reference types="jquery" />
/// <reference path="../../../lib/@types/requirejs/index.d.ts" />

/**
 * Loaded on the "testplugin" admin page
 */
requirejs(["jquery", "TestPlugin", "Tabs", "Greenify", "Common_Widgets", "bootstrap4-tagsinput"],function(jQuery, TestPlugin, TabsModule, GreenifyModule, CommonWidgetsModule, bootstrap4_tagsinput) {
    jQuery(function() {
        init();
        attachEventHandlers();
    });

    function init(){
        jQuery.fn.tagsinput = bootstrap4_tagsinput;
        let inputElements = jQuery('select.tagsinputtarget');
        TestPlugin.Utilities.IndicatorUIHelper.addTagsinput(inputElements);

        //init any jquery module usages
        TabsModule.Navigation.Tabs.Create(jQuery(".initTabs"));
        GreenifyModule.Visuals.Greenify.Create(jQuery(".testColor"));

        jQuery('.choiceButtonsContainer').ChoiceButton({ onSelectChoice: function(widget, name, choiceVal) {
                console.log("Choice \"" + choiceVal + "\" was selected.");
            }
        });

        jQuery('#testEditField').SingleEditField();
        jQuery('#fileDropTarget').FileDropArea();

        let pageCache = jQuery('#initialPageCache').data('initial-page-cache');
        let modelTablesContainer = jQuery('#modelTablesContainer');

        let tableHtml = TestPlugin.Utilities.ElementGeneratorHelper.getObjectArrayBootstrap4Table(pageCache['Languages'], 'Language');
        tableHtml += TestPlugin.Utilities.ElementGeneratorHelper.getObjectArrayBootstrap4Table(pageCache['Roles'], 'Role');
        tableHtml += TestPlugin.Utilities.ElementGeneratorHelper.getObjectArrayBootstrap4Table(pageCache['Settings'], 'Setting');
        tableHtml += TestPlugin.Utilities.ElementGeneratorHelper.getObjectArrayBootstrap4Table(pageCache['StoredStrings'], 'StoredString');
        tableHtml += TestPlugin.Utilities.ElementGeneratorHelper.getObjectArrayBootstrap4Table(pageCache['Users'], 'User');
        tableHtml += TestPlugin.Utilities.ElementGeneratorHelper.getObjectArrayBootstrap4Table(pageCache['UserGroups'], 'UserGroup');

        modelTablesContainer.empty().append(tableHtml);
    }

    //use this to attach all delegated event handlers
    function attachEventHandlers() {
        let body = jQuery("body");
        body.on("click",'#testAjaxButton',testAjaxCalls);

        body.on("click",'#testSetting1Form .pendingActionButton', function(){
            let $this = jQuery(this);

            let settingValInput = jQuery('#testSetting1Input');
            let settingTagsinput = settingValInput.parent().find('.bootstrap-tagsinput');
            //save keywords

            let settingValue = settingValInput.tagsinput('items');//because result is an array, join it to get a comma-separated list
            if(TestPlugin.Utilities.TypeChecker.isArray(settingValue)) {
                settingValue = settingValue.join();
            }

            let settingID = settingValInput.data("setting-id");

            //disable the same button, show loader
            $this.addClass('disabled');
            $this.addClass('pendingAction');
            settingTagsinput.addClass('disabled');

            jQuery.when(saveSettingModel(settingID, settingValue)).done(function(adminResponse){
                //enable the button, hide loader
                $this.removeClass('disabled');
                settingTagsinput.removeClass('disabled');
                settingTagsinput.removeClass('pendingAction');

                if(adminResponse.success) {
                    //use response, to update any cache or visuals
                    //adminResponse["result"]
                } else {
                    console.error("There was an error updating the setting value:",adminResponse.message);
                }
            });
        });
    }

    /** Ajax Calls **/

    function testAjaxCalls() {
        let loader = jQuery("#testPluginLoader");
        loader.show();

        jQuery.when(testUserAjax(), testAdminAjax()).done(function(userResponse, adminResponse){
            loader.hide();
            console.groupCollapsed("Test Ajax Calls");
                console.groupCollapsed("User Ajax");
                let userdata = userResponse[0];
                console.log(userdata);
                jQuery("#ajaxResponseMessage2").empty().append(userdata.message);
                console.groupEnd();

                console.groupCollapsed("Admin Ajax");
                let admindata = adminResponse[0];
                TestPlugin.PluginData.nonce = admindata.newNonce;
                console.log(admindata);
                jQuery("#ajaxResponseMessage1").empty().append(admindata.message);
                console.groupEnd();
            console.groupEnd();
        }).always(function(){
            loader.hide();
        });
    }

    function testUserAjax() {
        let jsonData = JSON.stringify([1,2,3]);
        let payload = new TestPlugin.WPAjaxPayload(
            TestPlugin.PluginData.ajaxEndpoints.user.getTestUserAjaxResponse,
            jsonData
        );

        return jQuery.ajax({
            data: payload.prepare(),
            success: function(data){

            },
            complete: function() {
                console.log("User ajax done");
            }
        });
    }

    function testAdminAjax() {
        let jsonData = JSON.stringify([1,2,3]);
        let payload = new TestPlugin.WPAjaxPayload(
            TestPlugin.PluginData.ajaxEndpoints.admin.getTestAdminAjaxResponse,
            jsonData,
            TestPlugin.PluginData.nonce
        );

        return jQuery.ajax({
            data: payload.prepare(),
            success: function(data){

            },
            complete: function() {
                console.log("Admin ajax done");
            }
        });
    }

    function saveSettingModel(settingID:string, settingVal:string[]):JQueryPromise<any> {
        let jsonData = {
            'object': 'Setting',
            'fieldsvalues': {'settingvalue':settingVal},
            'id': settingID
        };

        let payload = new TestPlugin.WPAjaxPayload(
            TestPlugin.PluginData.ajaxEndpoints.admin.saveObjectFields,
            JSON.stringify(jsonData),
            TestPlugin.PluginData.nonce
        ).prepare();

        return jQuery.ajax({
            data: payload
        });
    }

});

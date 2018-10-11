var TestPlugin = TestPlugin || {};

jQuery(document).ready(function() {
    TestPlugin.AdminJS.attachEventHandlers();

});

TestPlugin.AdminJS = {
    //use this to attach all delegated event handlers
    attachEventHandlers: function() {
        var body = jQuery("body");
        body.on("click",'#testAjaxButton',TestPlugin.AdminJS.testAjaxCall);

        //body.on("click",'#filterCategoriesListDialog > .filterCategoryDialogItem > input',);
    },

    /** Ajax Calls **/
    testAjaxCall: function() {
        var loader = jQuery("#testPluginLoader");
        loader.show();
        var jsonData = JSON.stringify([1,2,3]);
        var payload = {
            action: "getTestAdminAjaxResponse",
            param: jsonData,
            nonce: GlobalJSData.nonce
        };

        jQuery.ajax({
            type: "POST",
            url: GlobalJSData.ajaxurl,
            data: payload,
            dataType: "json",
            traditional: true,
            success: function(data){
                GlobalJSData.nonce = data.newNonce;
                console.log(data);
                jQuery("#ajaxResponseMessage1").append(data.message);
            },
            error: TestPlugin.HelperUtilities.Functions.AJAX.standardAjaxError,
            complete: function() {
                //loader.hide();
            }
        });


        jsonData = JSON.stringify([1,2,3]);
        payload = {
            action: "getTestUserAjaxResponse",
            param: jsonData,
        };

        jQuery.ajax({
            type: "POST",
            url: GlobalJSData.ajaxurl,
            data: payload,
            dataType: "json",
            traditional: true,
            success: function(data){
                console.log(data);
                jQuery("#ajaxResponseMessage2").append(data.message);
            },
            error: TestPlugin.HelperUtilities.Functions.AJAX.standardAjaxError,
            complete: function() {
                loader.hide();
            }
        });
    }
};
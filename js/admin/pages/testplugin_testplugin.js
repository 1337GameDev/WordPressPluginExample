/// <reference path="../../lib/@types/jquery/index.d.ts" />
newJquery(function () {
    TestPlugin.Admin.Pages.testplugin.attachEventHandlers();
});
TestPlugin.Admin.Pages.testplugin = {
    //use this to attach all delegated event handlers
    attachEventHandlers: function () {
        var body = newJquery("body");
        body.on("click", '#testAjaxButton', TestPlugin.Admin.Pages.testplugin.testAjaxCall);
        //body.on("click",'#filterCategoriesListDialog > .filterCategoryDialogItem > input',);
    },
    /** Ajax Calls **/
    testAjaxCall: function () {
        var loader = newJquery("#testPluginLoader");
        loader.show();
        var jsonData = JSON.stringify([1, 2, 3]);
        var payload = {
            action: "getTestAdminAjaxResponse",
            param: jsonData,
            nonce: TestPlugin.GlobalJSData.nonce
        };
        newJquery.ajax({
            type: "POST",
            url: TestPlugin.GlobalJSData.ajaxurl,
            data: payload,
            dataType: "json",
            traditional: true,
            success: function (data) {
                TestPlugin.GlobalJSData.nonce = data.newNonce;
                console.log(data);
                newJquery("#ajaxResponseMessage1").append(data.message);
            },
            error: TestPlugin.HelperUtilities.Functions.AJAX.standardAjaxError,
            complete: function () {
                //loader.hide();
            }
        });
        jsonData = JSON.stringify([1, 2, 3]);
        var payload2 = {
            action: "getTestUserAjaxResponse",
            param: jsonData,
        };
        newJquery.ajax({
            type: "POST",
            url: TestPlugin.GlobalJSData.ajaxurl,
            data: payload2,
            dataType: "json",
            traditional: true,
            success: function (data) {
                console.log(data);
                newJquery("#ajaxResponseMessage2").append(data.message);
            },
            error: TestPlugin.HelperUtilities.Functions.AJAX.standardAjaxError,
            complete: function () {
                loader.hide();
            }
        });
    }
};

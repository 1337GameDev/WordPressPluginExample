/// <reference types="jquery" />
/// <reference path="../lib/@types/requirejs/index.d.ts" />
/**
 * Loaded on every user-side page
 */
requirejs(["jquery", "TestPlugin", "Common_Widgets"], function (jQuery, TestPlugin, CommonWidgetsModule) {
    jQuery(function () {
        init();
        attachEventHandlers();
    });
    function init() {
        console.log('global user JS init');
    }
    //use this to attach all delegated event handlers
    function attachEventHandlers() {
        var body = jQuery("body");
        //body.on("click",'#filterCategoriesListDialog > .filterCategoryDialogItem > input',);
    }
});
//# sourceMappingURL=user.js.map
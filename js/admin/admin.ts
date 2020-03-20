/// <reference types="jquery" />
/// <reference path="../lib/@types/requirejs/index.d.ts" />


/**
 * Loaded on every admin page
 */
requirejs(["jquery", "TestPlugin", "Common_Widgets"],function(jQuery, TestPlugin, CommonWidgetsModule) {
    jQuery(function() {
        init();
        attachEventHandlers();
    });

    function init(){
        console.log('global admin JS init');
    }

    //use this to attach all delegated event handlers
    function attachEventHandlers() {
        let body = jQuery("body");
        //body.on("click",'#filterCategoriesListDialog > .filterCategoryDialogItem > input',);
    }


});

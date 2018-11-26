/// <reference path="./lib/@types/jquery/index.d.ts" />
var testplugin_GlobalJSData; //provided by WordPress via "wp_localize_script"
var newJquery = jQuery.noConflict();
var TestPlugin = {
    Admin: {
        Pages: {}
    },
    User: {
        Pages: {}
    },
    GlobalJSData: testplugin_GlobalJSData,
    HelperUtilities: {
        Functions: {
            AJAX: {
                standardAjaxError: function (jqXHR, textStatus, errorThrown) {
                    var details = JSON.stringify(jqXHR, null, 4);
                    console.error("Exception: " + errorThrown + " - Status: " + textStatus + " - XMLHTTPRequest:" + details);
                }
            }
        }
    }
};
//unset any globals
testplugin_GlobalJSData = null;

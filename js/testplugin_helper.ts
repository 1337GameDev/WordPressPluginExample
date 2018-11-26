/// <reference path="./lib/@types/jquery/index.d.ts" />
let testplugin_GlobalJSData; //provided by WordPress via "wp_localize_script"
let newJquery:JQueryStatic = jQuery.noConflict();

let TestPlugin = {
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
                    let details = JSON.stringify(jqXHR, null, 4);
                    console.error("Exception: " + errorThrown + " - Status: " + textStatus + " - XMLHTTPRequest:" + details);
                }
            }
        }
    }

};

//unset any globals
testplugin_GlobalJSData = null;

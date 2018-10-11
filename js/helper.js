var TestPlugin = TestPlugin || {};

TestPlugin.HelperUtilities = {
    Functions: {
        AJAX: {
            standardAjaxError: function (jqXHR, textStatus, errorThrown){
                var details = JSON.stringify(jqXHR, null, 4);
                console.error("Exception: "+errorThrown+" - Status: "+textStatus + " - XMLHTTPRequest:" + details);
            }
        }
    }
};



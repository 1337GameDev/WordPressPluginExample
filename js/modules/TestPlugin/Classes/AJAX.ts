/**
 * A class to hold functions related to AJAX calls
 */
export class AJAX {
    public static standardAjaxError(jqXHR, textStatus:string, errorThrown) {
        let details = JSON.stringify(jqXHR, null, 4);
        console.error("Exception: " + errorThrown + " - Status: " + textStatus + " - XMLHTTPRequest:" + details);
    }

    public static standardAjaxSuccess(data) {
        console.log("Ajax Success:"+data);
    }

    public static standardAjaxOnProgress(evt:ProgressEvent) {
        console.log("Ajax Progress:"+evt);
    }
}
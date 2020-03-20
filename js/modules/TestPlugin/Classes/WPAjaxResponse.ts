import {TypeChecker} from "./TypeChecker";
import {DynamicObject} from "./DynamicObject";
import {IWPAjaxResponse} from "./Interfaces";

/**
 * A class that represents a response from a plugin AJAX endpoint
 */
export class WPAjaxResponse implements IWPAjaxResponse {
    public success:boolean;
    public result:any;
    public message:string;
    public newNonce:string;

    constructor(s:boolean, r: any, m:string, n:string) {
        this.success = s;
        this.result = r;
        this.message = m;
        this.newNonce = n;
    }
    public static fromRawObj(obj:any):WPAjaxResponse {
        let s,r,m,n = "";
        if (obj.hasOwnProperty('success')) {
            s = obj.success;
            if(!TypeChecker.isBoolean(obj.success)) {// empty/undefined
                console.warn("\'success\' parameter was not a boolean for \'WPAjaxResponse\'.");
            }
        }
        if (obj.hasOwnProperty('result')) {
            r = obj.result;
        }
        if (obj.hasOwnProperty('message')) {
            m = obj.message;
            if(!(TypeChecker.isString(obj.message) || TypeChecker.isArray(obj.message))) {
                console.warn("\'message\' parameter was not a string for \'WPAjaxResponse\'.");
            }
        }
        if (obj.hasOwnProperty('newNonce')) {
            n = obj.newNonce;
            if(!TypeChecker.isString(obj.newNonce)) {// empty/undefined
                console.warn("\'newNonce\' parameter was not a string for \'WPAjaxResponse\'.");
            }
        }

        return new WPAjaxResponse(s,r,m,n);
    }
}
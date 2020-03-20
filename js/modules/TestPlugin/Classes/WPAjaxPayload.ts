import {TypeChecker} from "./TypeChecker";
import {DynamicObject} from "./DynamicObject";
import {IWPAjaxPayload} from "./Interfaces";

/**
 * A class that represents the payload that should be sent via ajax to a plugin AJAX endpoint
 */
export class WPAjaxPayload implements IWPAjaxPayload {
    public action:string;
    public param:any;
    public nonce?:string;

    constructor(axn:string, par: any, n?:string) {
        this.action = axn;
        this.param = par;
        this.nonce = n;
    }
    public static fromRawObj(obj:any):WPAjaxPayload {
        let a,p,n = "";
        if (obj.hasOwnProperty('action')) {
            a = obj.action;
            if(!obj.action || !TypeChecker.isString(obj.action)) {// empty/undefined
                console.warn("\'Action\' parameter was missing for \'WPAjaxPayload\'.");
            }
        }
        if (obj.hasOwnProperty('param')) {
            p = obj.param;
            if(!obj.param || !TypeChecker.isString(obj.param)) {// empty/undefined
                console.warn("\'Param\' parameter was missing for \'WPAjaxPayload\'.");
            }
        }
        if (obj.hasOwnProperty('nonce')) {
            n = obj.nonce;
        }

        return new WPAjaxPayload(a,p,n);
    }

    public prepare():DynamicObject {
        let that = this;
        return {action: that.action, param: that.param, nonce: that.nonce};
    }

}
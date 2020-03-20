import {TypeChecker} from "./TypeChecker";
import {IGlobalWPPluginData} from "./Interfaces";

/**
 * Represents data received from WordPress via "localize_script"
 *
 */
export class GlobalWPPluginData implements IGlobalWPPluginData {
    //the URL of the WorDPress site
    public siteurl: string;
    //the URL to send ajax requests to
    public ajaxurl: string;
    public nonce: string;
    //the URL to the base plugin folder
    public pluginURL: string;
    //the URL to wp_uploads (provided by "wp_upload_dir()")
    public uploadsURL: string;
    //the name of the plugin
    public pluginName: string;
    //the registered endpoints, returned as a list of  names
    public ajaxEndpoints: any[];

    constructor(site:string, ajx:string, plg:string, uplds:string, n?:string, name?:string, endpoints?:any[]) {
        this.siteurl = site;
        this.ajaxurl = ajx;
        this.nonce = n;
        this.pluginURL = plg;
        this.uploadsURL = uplds;
        this.pluginName = name;
        this.ajaxEndpoints = endpoints;
    }

    public static fromRawObj(obj:any):GlobalWPPluginData {
        let s,a,n,p,u,na = "";
        let en:any[] = [];

        if (obj.hasOwnProperty('siteurl')) {
            s = obj.siteurl;
            if(!obj.siteurl || !TypeChecker.isString(obj.siteurl)) {// empty/undefined
                console.warn("\'Siteurl\' parameter was missing for \'GlobalWPPluginData\'.");
            }
        }

        if (obj.hasOwnProperty('ajaxurl')) {
            a = obj.ajaxurl;
            if(!obj.ajaxurl || !TypeChecker.isString(obj.ajaxurl)) {// empty/undefined
                console.warn("\'Ajaxurl\' parameter was missing for \'GlobalWPPluginData\'.");
            }
        }
        if (obj.hasOwnProperty('nonce')) {
            n = obj.nonce;
        }
        if (obj.hasOwnProperty('pluginURL')) {
            p = obj.pluginURL;
            if(!obj.pluginURL || !TypeChecker.isString(obj.pluginURL)) {// empty/undefined
                console.warn("\'PluginURL\' parameter was missing for \'GlobalWPPluginData\'.");
            }
        }
        if (obj.hasOwnProperty('uploadsURL')) {
            u = obj.uploadsURL;
            if(!obj.uploadsURL || !TypeChecker.isString(obj.uploadsURL)) {// empty/undefined
                console.warn("\'UploadsURL\' parameter was missing for \'GlobalWPPluginData\'.");
            }
        }
        if (obj.hasOwnProperty('pluginName')) {
            na = obj.pluginName;
            if(!obj.pluginName || !TypeChecker.isString(obj.pluginName)) {// empty/undefined
                console.warn("\'PluginName\' parameter was missing for \'GlobalWPPluginData\'.");
            }
        }
        if (obj.hasOwnProperty('ajaxEndpoints')) {
            en = obj.ajaxEndpoints;
            if(!obj.ajaxEndpoints || !TypeChecker.isObject(obj.ajaxEndpoints)) {// empty/undefined
                console.warn("\'AjaxEndpoints\' parameter was missing for \'GlobalWPPluginData\'.");
            }
        }

        return new GlobalWPPluginData(s,a,p,u,n,na,en);
    }
}
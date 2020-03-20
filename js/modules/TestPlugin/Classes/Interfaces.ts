// Type definitions for test 1.0.0
// Project: Test
// Definitions by: Author Name

import {DynamicObject} from "./DynamicObject";

export interface testplugin_Context_example {
    value1:number;
    someOtherValues:string[];
}

export interface testpluginuser_Context_example {
    val1:number;
    otherValues:string[];
}

export interface IGlobalWPPluginData {
    ajaxurl: string;
    nonce: string;
    pluginURL: string;
    uploadsURL: string;
}

export interface IWPAjaxPayload {
    action:string;
    param:any;
    nonce?:string;
}

export interface IWPAjaxResponse {
    success:boolean;
    result:any;
    message?:string;
    newNonce:string;
}

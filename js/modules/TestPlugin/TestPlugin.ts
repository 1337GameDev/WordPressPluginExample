/// <reference types="jquery" />

import * as jQueryModule from 'jquery';
import {GlobalWPPluginData as GlobalWPPluginDataClass} from "./Classes/GlobalWPPluginData";
import {WPAjaxPayload as WPAjaxPayloadClass} from "./Classes/WPAjaxPayload";
import {WPAjaxResponse as WPAjaxResponseClass} from "./Classes/WPAjaxResponse";
import {AJAX as AJAXClass} from "./Classes/AJAX";
import {Helper as HelperClass} from "./Classes/Helper";
import {TypeChecker as TypeCheckerClass} from "./Classes/TypeChecker";
import {IndicatorUIHelper as IndicatorUIHelperClass} from "./Classes/IndicatorUIHelper";
import {LoaderUIHelper as LoaderUIHelperClass} from "./Classes/LoaderUIHelper";
import {ContextHelper as ContextHelperClass} from "./Classes/ContextHelper";
import {ElementGeneratorHelper as ElementGeneratorHelperClass} from "./Classes/ElementGeneratorHelper";
import {BrowserDetect as BrowserDetectClass} from "./Classes/BrowserDetect";

import {testplugin_Context as testplugin_ContextClass} from "./Contexts/admin/testplugin_Context";

export namespace TestPlugin {
    export const GlobalWPPluginData = GlobalWPPluginDataClass;
    export type GlobalWPPluginData = GlobalWPPluginDataClass;
    export let PluginData = null;

    export const WPAjaxPayload = WPAjaxPayloadClass;
    export type WPAjaxPayload = WPAjaxPayloadClass;

    export const WPAjaxResponse = WPAjaxResponseClass;
    export type WPAjaxResponse = WPAjaxResponseClass;

    export const ContextHelper = ContextHelperClass;
    export type ContextHelper = ContextHelperClass;

    export class Utilities {}
    export namespace Utilities {
        export const AJAX = AJAXClass;
        export type AJAX = AJAXClass;

        export const Helper = HelperClass;
        export type Helper = HelperClass;

        export const TypeChecker = TypeCheckerClass;
        export type TypeChecker = TypeCheckerClass;

        export const BrowserDetect = BrowserDetectClass;
        export type BrowserDetect = BrowserDetectClass;

        export const LoaderUIHelper = LoaderUIHelperClass;
        export type LoaderUIHelper = LoaderUIHelperClass;

        export const IndicatorUIHelper = IndicatorUIHelperClass;
        export type IndicatorUIHelper = IndicatorUIHelperClass;

        export const ElementGeneratorHelper = ElementGeneratorHelperClass;
        export type ElementGeneratorHelper = ElementGeneratorHelperClass;
    }

    /* Use these on pages when grouping data to be loaded for that page. Strongly types some fields / data to help prevent runtime issues. */
    export class Contexts {}
    export namespace Contexts {
        export class admin {}
        export namespace admin {
            export const testplugin_Context = testplugin_ContextClass;
            export type testplugin_Context = testplugin_ContextClass;
        }

        export class user {}
        export namespace user {}
    }

    export class Extensions {}
    export namespace Extensions {
        //used to expose items to the page scripts that are only available to TypeScript (and not requirejs)
    }

    /* Any custom events to help trigger customized functionality, but have some common method for triggering them */
    export class Events {}
    export namespace Events {
        export const MyEvent = new CustomEvent('customEvent', {
            bubbles: true
        });
    }

    export function init(pluginData:any) {
        if(!pluginData) {
            throw new TypeError("The pluginData parameter was invalid.")
        } else {
            TestPlugin.PluginData = TestPlugin.GlobalWPPluginData.fromRawObj(pluginData);
        }

        setJQueryDefaults(jQueryModule);
    }

    export function attachHandlers() {
        let body = jQuery("body");
        //body.on("click",".testClass",function(){});

        body.on("click",".linkButton", function(){
            let $this = jQuery(this);
            let urlToOpen = $this.data('link-to-open');
            let urlTarget = $this.data('open-target');

            if(TestPlugin.Utilities.TypeChecker.isEmpty(urlToOpen) ) {
                return;
            }

            if(TestPlugin.Utilities.TypeChecker.isEmpty(urlTarget) ) {
                urlTarget = "current";
            }

            switch (urlTarget) {
                case "new":
                    TestPlugin.Utilities.Helper.openInNewTab(urlToOpen);
                    break;
                default:
                    window.location.href = urlToOpen;
            }

        });
    }

    export function setJQueryDefaults(jq:JQueryStatic){
        //set ajax defaults
        var jsonMimeType = "application/json;charset=UTF-8";
        jq.ajaxSetup({
            type: "POST",
            url: TestPlugin.PluginData.ajaxurl,
            dataType: "json",
            traditional: true,
            error: TestPlugin.Utilities.AJAX.standardAjaxError,
            beforeSend: function(x) {
                if(x && x.overrideMimeType) {
                    x.overrideMimeType(jsonMimeType);
                }
            },
        });

        jq(this).ajaxSuccess(function(event, request) {
            let data = request.responseJSON;
            if(!TestPlugin.Utilities.TypeChecker.isUndefined(data.newNonce)) {
                TestPlugin.PluginData.nonce = data.newNonce;
            }
        });

        TestPlugin.Utilities.Helper.addCustomValidators(jQuery);
    }
}
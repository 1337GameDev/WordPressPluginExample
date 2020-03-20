/// <reference path="../../lib/@types/jquery/index.d.ts" />
import * as jQueryModule from 'jquery';
import {GlobalWidgetSettings as GlobalWidgetSettingsClass} from './Classes/GlobalWidgetSettings';
import {SingleEditField} from "./Classes/SingleEditField";
import {FileDropArea} from "./Classes/FileDropArea";
import {DynamicObject} from "./Classes/DynamicObject";
import {Helper} from "./Classes/Helper";
import {ChoiceButton} from "./Classes/ChoiceButton";
import {WidgetBase} from "./Classes/WidgetBase";
import {CommonWidgetsJquerySignature} from "./Classes/Interfaces";

export namespace CommonWidgets {
    //export classes to expose them as types
    export const WidgetBaseClass = WidgetBase;
    export type WidgetBaseClass = WidgetBase;
    export const ChoiceButtonClass = ChoiceButton;
    export type ChoiceButtonClass = ChoiceButton;
    export const SingleEditFieldClass = SingleEditField;
    export type SingleEditFieldClass = SingleEditField;
    export const FileDropAreaClass = FileDropArea;
    export type FileDropAreaClass = FileDropArea;

    export let GlobalWidgetSettings = new GlobalWidgetSettingsClass();
    export function attachToJQuery(jq:JQueryStatic) {
        Helper.AddJQueryNamespaceFunction(jq);

        jQueryModule.namespace('CommonWidgets', {
            SetAsReadOnly: function(){
                Helper.SetAsReadOnly(jq(this));
            },
            RemoveReadOnly: function(){
                Helper.RemoveReadOnly(jq(this));
            },
            SetAsDisabled: function(){
                Helper.SetAsDisabled(jq(this));
            },
            RemoveDisabled: function(){
                Helper.RemoveDisabled(jq(this));
            },
            removeClassesWithPrefix: function(prefix:string){
                return Helper.removeClassesWithPrefix(jq(this), prefix);
            },
            setDependencyWarningMessageDisplay: function(showMessages:boolean){
                GlobalWidgetSettingsClass.dependencyWarningMessageDisplay = showMessages;
            },
            custom_multiselect: function(options:DynamicObject){
                return Helper.custom_multiselect(jq(this), options);
            },
            custom_bootstrap_select: function(options:DynamicObject){
                return Helper.custom_bootstrap_select(jq(this), options);
            },
        });

        jq = SingleEditField.AttachToJQuery(jq);
        jq = ChoiceButton.AttachToJQuery(jq);
        jq = FileDropArea.AttachToJQuery(jq);

    }
}

declare global {
    interface JQuery {
        CommonWidgets:CommonWidgetsJquerySignature
    }
    interface JQueryStatic {
        CommonWidgets:CommonWidgetsJquerySignature
    }
}

CommonWidgets.attachToJQuery(jQueryModule);
WidgetBase.performSingleLoadOperations();

jQueryModule(function() {
    //any special handlers
    let body = jQueryModule("body");

    body.on("click", '.dropdown-submenu a.open-submenu', function (e) {
        jQueryModule(this).next('ul').toggle();
        e.stopPropagation();
        e.preventDefault();
    });

    body.on("click", '.preventEventBubble', function (e) {
        e.stopPropagation();
        e.preventDefault();
    });
});
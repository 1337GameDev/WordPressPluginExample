/// <reference types="jquery" />

import * as jQueryModule from 'jquery';

export class LoaderUIHelper {
    public static add3DotLoaderAfter($target:JQuery, initiallyHidden:boolean = true) {
        let hiddenClass = initiallyHidden ? "hidden" : "";
        $target.after(
            '<div class="threedotloader '+hiddenClass+'">\n'+
            '<div class="bounce1"></div>\n'+
            '<div class="bounce2"></div>\n'+
            '<div class="bounce3"></div>\n'+
            '</div>'
        );
    }

    public static remove3DotLoaderAfter($target:JQuery) {
        $target.parent().children('.threedotloader').remove();
    }


}
/// <reference types="jquery" />

import * as jQueryModule from 'jquery';

export class IndicatorUIHelper {
    public static addSuccessIndicatorAfter($target:JQuery) {
        $target.after(
            '<div class="statusIndicatorContainer">' +
            '<i class="fa fa-2x fa-check-circle success hidden" aria-hidden="true"></i>' +
            '<i class="fa fa-2x fa-times-circle error hidden" aria-hidden="true"></i>' +
            '</div>'
        );
    }

    public static removeSuccessIndicatorAfter($target:JQuery) {
        $target.parent().children('.statusIndicatorContainer').remove();
    }

    public static showIndicator($indicatorContainer:JQuery, success:boolean) {
        if(($indicatorContainer.length > 0) && $indicatorContainer.hasClass('statusIndicatorContainer')) {
            let $successIcon = $indicatorContainer.find('i.success');
            let $errorIcon = $indicatorContainer.find('i.error');
            let iconToFade = (success) ? $successIcon : $errorIcon;

            iconToFade.fadeIn(500, function () {
                setTimeout(function () {
                    iconToFade.fadeOut(500);
                }, 3000);
            });
        }
    }

    //use this in case there are extra setup / logic needed for indicating a pending action on a table row
    public static setTableRowPendingAction($tableRow:JQuery, pendingAction:boolean = true) {
        if ($tableRow.length > 0 && $tableRow.is("tr")) {
            if (pendingAction) {
                $tableRow.addClass('pendingAction');
            } else {
                $tableRow.removeClass('pendingAction');
            }
        }
    }

    public static elementHasPendingAction($target:JQuery, lookInChildren:boolean = false):boolean {
        if(($target === null) || ($target.length === 0)) {
            return false;
        }

        if(!lookInChildren) {
            return $target.hasClass('pendingAction');
        } else {
            return $target.find('.pendingAction').length > 0;
        }
    }

    public static markElementAsFavorite($target:JQuery) {
        if(($target === null) || ($target.length === 0)) {
            return false;
        }

        $target.addClass('favorited');
    }

    public static unmarkElementAsFavorite($target:JQuery) {
        if(($target === null) || ($target.length === 0)) {
            return false;
        }

        $target.removeClass('favorited');
    }

    public static toggleFavorite($target:JQuery){
        if(($target === null) || ($target.length === 0)) {
            return false;
        }

        $target.toggleClass('favorited');
    }

    public static addTooltips($target:JQuery, targetClass:string = "tooltiptarget"){
        if(typeof $target.tooltipster !== 'undefined'){
            let options = {
                //default options go here
            };
            if($target.length > 0) {
                let targets = $target.find("."+targetClass+":not(.tooltipstered)");
                if($target.hasClass(targetClass) && !$target.hasClass('tooltipstered')) {
                    targets = targets.add($target);
                }

                //we know this exists because we checked above
                targets.tooltipster(options);
            }
        }
    }

    public static addTagsinput($target:JQuery, targetClass:string = "tagsinputtarget"){
        if(typeof (<any>$target).tagsinput !== 'undefined'){
            let maxTagChars = 32;

            if($target.data("tag-max-length")) {
                maxTagChars = $target.data("tag-max-length");
            }
            let options = {
                //keys: enter, comma, space, tab
                confirmKeys: [13, 188, 32, 9],
                maxChars: maxTagChars,
                trimValue: true
            };

            if($target.length > 0) {
                let targets = $target.find("select."+targetClass+",input."+targetClass);
                if($target.hasClass(targetClass)) {
                    targets = targets.add($target);
                }
                //we know this exists because we checked above
                (<any>targets).tagsinput(options);
            }
        }
    }

    public static disableTagsinput($target:JQuery){
        if($target.length > 0 && $target.hasClass("bootstrap-tagsinput")) {
            $target.addClass("disabled");
        }
    }

    public static enableTagsinput($target:JQuery){
        if($target.length > 0 && $target.hasClass("bootstrap-tagsinput")) {
            $target.removeClass("disabled");
        }
    }
}
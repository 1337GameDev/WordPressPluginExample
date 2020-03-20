/// <reference types="jquery" />
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var IndicatorUIHelper = /** @class */ (function () {
        function IndicatorUIHelper() {
        }
        IndicatorUIHelper.addSuccessIndicatorAfter = function ($target) {
            $target.after('<div class="statusIndicatorContainer">' +
                '<i class="fa fa-2x fa-check-circle success hidden" aria-hidden="true"></i>' +
                '<i class="fa fa-2x fa-times-circle error hidden" aria-hidden="true"></i>' +
                '</div>');
        };
        IndicatorUIHelper.removeSuccessIndicatorAfter = function ($target) {
            $target.parent().children('.statusIndicatorContainer').remove();
        };
        IndicatorUIHelper.showIndicator = function ($indicatorContainer, success) {
            if (($indicatorContainer.length > 0) && $indicatorContainer.hasClass('statusIndicatorContainer')) {
                var $successIcon = $indicatorContainer.find('i.success');
                var $errorIcon = $indicatorContainer.find('i.error');
                var iconToFade_1 = (success) ? $successIcon : $errorIcon;
                iconToFade_1.fadeIn(500, function () {
                    setTimeout(function () {
                        iconToFade_1.fadeOut(500);
                    }, 3000);
                });
            }
        };
        //use this in case there are extra setup / logic needed for indicating a pending action on a table row
        IndicatorUIHelper.setTableRowPendingAction = function ($tableRow, pendingAction) {
            if (pendingAction === void 0) { pendingAction = true; }
            if ($tableRow.length > 0 && $tableRow.is("tr")) {
                if (pendingAction) {
                    $tableRow.addClass('pendingAction');
                }
                else {
                    $tableRow.removeClass('pendingAction');
                }
            }
        };
        IndicatorUIHelper.elementHasPendingAction = function ($target, lookInChildren) {
            if (lookInChildren === void 0) { lookInChildren = false; }
            if (($target === null) || ($target.length === 0)) {
                return false;
            }
            if (!lookInChildren) {
                return $target.hasClass('pendingAction');
            }
            else {
                return $target.find('.pendingAction').length > 0;
            }
        };
        IndicatorUIHelper.markElementAsFavorite = function ($target) {
            if (($target === null) || ($target.length === 0)) {
                return false;
            }
            $target.addClass('favorited');
        };
        IndicatorUIHelper.unmarkElementAsFavorite = function ($target) {
            if (($target === null) || ($target.length === 0)) {
                return false;
            }
            $target.removeClass('favorited');
        };
        IndicatorUIHelper.toggleFavorite = function ($target) {
            if (($target === null) || ($target.length === 0)) {
                return false;
            }
            $target.toggleClass('favorited');
        };
        IndicatorUIHelper.addTooltips = function ($target, targetClass) {
            if (targetClass === void 0) { targetClass = "tooltiptarget"; }
            if (typeof $target.tooltipster !== 'undefined') {
                var options = {
                //default options go here
                };
                if ($target.length > 0) {
                    var targets = $target.find("." + targetClass + ":not(.tooltipstered)");
                    if ($target.hasClass(targetClass) && !$target.hasClass('tooltipstered')) {
                        targets = targets.add($target);
                    }
                    //we know this exists because we checked above
                    targets.tooltipster(options);
                }
            }
        };
        IndicatorUIHelper.addTagsinput = function ($target, targetClass) {
            if (targetClass === void 0) { targetClass = "tagsinputtarget"; }
            if (typeof $target.tagsinput !== 'undefined') {
                var maxTagChars = 32;
                if ($target.data("tag-max-length")) {
                    maxTagChars = $target.data("tag-max-length");
                }
                var options = {
                    //keys: enter, comma, space, tab
                    confirmKeys: [13, 188, 32, 9],
                    maxChars: maxTagChars,
                    trimValue: true
                };
                if ($target.length > 0) {
                    var targets = $target.find("select." + targetClass + ",input." + targetClass);
                    if ($target.hasClass(targetClass)) {
                        targets = targets.add($target);
                    }
                    //we know this exists because we checked above
                    targets.tagsinput(options);
                }
            }
        };
        IndicatorUIHelper.disableTagsinput = function ($target) {
            if ($target.length > 0 && $target.hasClass("bootstrap-tagsinput")) {
                $target.addClass("disabled");
            }
        };
        IndicatorUIHelper.enableTagsinput = function ($target) {
            if ($target.length > 0 && $target.hasClass("bootstrap-tagsinput")) {
                $target.removeClass("disabled");
            }
        };
        return IndicatorUIHelper;
    }());
    exports.IndicatorUIHelper = IndicatorUIHelper;
});
//# sourceMappingURL=IndicatorUIHelper.js.map
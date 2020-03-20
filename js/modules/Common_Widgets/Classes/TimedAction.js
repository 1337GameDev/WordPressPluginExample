(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "jquery"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var jQueryModule = require("jquery");
    var TimedAction = /** @class */ (function () {
        function TimedAction(targetToCall, settings) {
            this.currentIntervalInstance = null;
            this.hasIntervalInstance = false;
            this.currentTimeMillis = 0;
            this.functionsToCall = [];
            this.defaults = {
                maxTime: 3000,
                tickRateMillis: 1000,
                repeatedlyInvoke: false,
                startImmediately: false
            };
            this.maxTimeMillis = 0;
            this.tickRateMillis = 1000;
            this.repeatedlyInvoke = false; //if this should invoke the functions to call more than once when the timer expires (if not this object will be disposed after the first invocation)
            this.startImmediately = false;
            //settings
            var newSettings = null;
            newSettings = jQueryModule.extend({}, this.defaults, settings);
            this.tickRateMillis = newSettings.tickRateMillis;
            this.repeatedlyInvoke = newSettings.repeatedlyInvoke;
            this.startImmediately = newSettings.startImmediately;
            if (typeof targetToCall === 'undefined') {
                this.functionsToCall = [];
            }
            else {
                if (Array.isArray(targetToCall)) {
                    this.functionsToCall = targetToCall;
                }
                else {
                    this.functionsToCall = [targetToCall];
                }
            }
            this.maxTimeMillis = newSettings.maxTime;
            if (this.startImmediately) {
                this.hasIntervalInstance = true;
                this.currentIntervalInstance = setInterval(this.timerLoopFunction, this.tickRateMillis);
            }
        }
        TimedAction.prototype.SetMaxTime = function (newMax) {
            this.maxTimeMillis = newMax;
        };
        TimedAction.prototype.SetTickRate = function (newRate) {
            this.tickRateMillis = newRate;
        };
        TimedAction.prototype.SetRepeatedlyInvoke = function (newRepeat) {
            this.repeatedlyInvoke = newRepeat;
        };
        TimedAction.prototype.GetCurrentTime = function () {
            return this.currentTimeMillis;
        };
        TimedAction.prototype.ResetCurrentTime = function () {
            this.currentTimeMillis = 0;
        };
        TimedAction.prototype.Reet = function () {
            clearInterval(this.currentIntervalInstance);
            this.hasIntervalInstance = true;
            this.currentIntervalInstance = setInterval(this.timerLoopFunction, this.tickRateMillis);
        };
        TimedAction.prototype.Stop = function () {
            clearInterval(this.currentIntervalInstance);
            this.hasIntervalInstance = false;
        };
        TimedAction.prototype.Trigger = function () {
            this.ResetCurrentTime();
            this.triggerAllTargets();
        };
        TimedAction.prototype.IsActive = function () {
            return this.hasIntervalInstance;
        };
        TimedAction.prototype.triggerAllTargets = function () {
            this.functionsToCall.forEach(function (target) {
                try {
                    if (typeof target === 'function') {
                        target();
                    }
                    else {
                        console.warn("Target to call wasn't a function.");
                    }
                }
                catch (ex) {
                    console.warn(ex);
                }
            });
        };
        ;
        TimedAction.prototype.timerLoopFunction = function () {
            this.currentTimeMillis += this.tickRateMillis;
            if (this.currentTimeMillis >= this.maxTimeMillis) {
                //invoke functions
                this.triggerAllTargets();
                this.currentTimeMillis = 0;
                if (!this.repeatedlyInvoke) {
                    this.hasIntervalInstance = false;
                    clearInterval(this.currentIntervalInstance);
                }
            }
        };
        return TimedAction;
    }());
    exports.TimedAction = TimedAction;
});
//# sourceMappingURL=TimedAction.js.map
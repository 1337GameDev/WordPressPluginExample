/* Timed Action - An object that represents an action to be executed sometime in the future
 *
 * This object can also handle interrupts (resetting the counter/timer)
 */
import {DynamicObject} from "./DynamicObject";
import * as jQueryModule from 'jquery';

export class TimedAction {
    currentIntervalInstance = null;
    hasIntervalInstance:boolean = false;
    currentTimeMillis:number = 0;
    functionsToCall = [];

    defaults:DynamicObject = {
        maxTime: 3000,
        tickRateMillis: 1000,
        repeatedlyInvoke: false,
        startImmediately: false
    };

    maxTimeMillis:number = 0;
    tickRateMillis:number = 1000;
    repeatedlyInvoke:boolean = false;//if this should invoke the functions to call more than once when the timer expires (if not this object will be disposed after the first invocation)
    startImmediately:boolean = false;

    constructor(targetToCall:any, settings:DynamicObject){
        //settings
        let newSettings = null;
        newSettings = jQueryModule.extend({}, this.defaults, settings);
        this.tickRateMillis = newSettings.tickRateMillis;
        this.repeatedlyInvoke = newSettings.repeatedlyInvoke;
        this.startImmediately = newSettings.startImmediately;

        if (typeof targetToCall === 'undefined') {
            this.functionsToCall = [];
        } else {
            if (Array.isArray(targetToCall)) {
                this.functionsToCall = targetToCall;
            } else {
                this.functionsToCall = [targetToCall];
            }
        }

        this.maxTimeMillis = newSettings.maxTime;

        if (this.startImmediately) {
            this.hasIntervalInstance = true;
            this.currentIntervalInstance = setInterval(this.timerLoopFunction, this.tickRateMillis);
        }
    }

    public SetMaxTime(newMax) {
        this.maxTimeMillis = newMax;
    }

    public SetTickRate(newRate) {
        this.tickRateMillis = newRate;
    }

    public SetRepeatedlyInvoke(newRepeat) {
        this.repeatedlyInvoke = newRepeat;
    }

    public GetCurrentTime() {
            return this.currentTimeMillis;
    }

    public ResetCurrentTime() {
        this.currentTimeMillis = 0;
    }

    public Reet() {
        clearInterval(this.currentIntervalInstance);
        this.hasIntervalInstance = true;
        this.currentIntervalInstance = setInterval(this.timerLoopFunction, this.tickRateMillis);
    }

    public Stop() {
        clearInterval(this.currentIntervalInstance);
        this.hasIntervalInstance = false;
    }

    public Trigger() {
        this.ResetCurrentTime();
        this.triggerAllTargets();
    }

    public IsActive() {//if this timed action has anything being executed with "setInterval"
        return this.hasIntervalInstance;
    }

    public triggerAllTargets() {
        this.functionsToCall.forEach(function (target) {
            try {
                if (typeof target === 'function') {
                    target();
                } else {
                    console.warn("Target to call wasn't a function.");
                }
            } catch (ex) {
                console.warn(ex);
            }
        });
    };

    public timerLoopFunction() {
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
    }
}
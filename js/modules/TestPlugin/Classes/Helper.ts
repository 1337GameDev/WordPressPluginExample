/// <reference types="jquery" />

import * as jQueryModule from 'jquery';
import {TypeChecker} from "./TypeChecker";
import {DynamicObject} from "./DynamicObject";
import {AJAX} from "./AJAX";
import * as numeral from "numeral";

type CheckFunction = (any)=>boolean;

export class Helper {
    //window unload function list
    private static windowUnloadFunctionsToCall = [];

    //merges object 2 INTO object 1 (and returns a copy of that merge)
    public static mergeObjects(obj1:DynamicObject, obj2:DynamicObject, excludeInvalidValues = true) {
        let result:DynamicObject = {};
        let dest = obj1;
        let src = obj2;

        if(excludeInvalidValues) {
            src = Helper.filterInvalidProperties(src);
        }

        result = jQueryModule.extend({}, dest, src);

        return result;
    }

    /**
     * Uses stringify and parse to convert a javascipt object to a string and back.
     * This can be expensive, but shouldn't be done too often.
     *
     * @param obj The object to deep copy
     */
    public static deepCopyObject(obj:DynamicObject = {}):DynamicObject {
        return JSON.parse(JSON.stringify(obj));
    }

    //use this function when handling an element in the DOM yet (as jQuery data handles DOM elements).
    //if you use this on elements created as jquery elements (not in the DOM yet) then the data won't be available when added to the DOM
    public static addAllPropertiesAsData($object:JQuery, data:any[]|object) {
        for (let name in data) {
            if (data.hasOwnProperty(name)) {
                $object.data(name.toLowerCase(), data[name]);
            }
        }
    }

    //use this function when handling an element NOT in the DOM yet (as jQuery data handles DOM elements)
    public static addAllPropertiesAsDataAttr($object:JQuery, data:any[]|object) {
        for (let name in data) {
            if (data.hasOwnProperty(name)) {
                $object.attr("data-"+name.toLowerCase(), data[name]);
            }
        }
    }

    //removes null and undefined properties from an object
    public static filterInvalidProperties(obj:DynamicObject):DynamicObject {
        return Helper.filterPropertiesOfObject(obj, function(prop:any, value:any){
            return !TypeChecker.isUndefined(value) && !TypeChecker.isNull(value);
        });
    }

    //removes undefined properties from an object
    public static filterUndefinedProperties(obj:DynamicObject):DynamicObject {
        return Helper.filterPropertiesOfObject(obj, function(prop:any, value:any){
            return !TypeChecker.isUndefined(value);
        });
    }

    //removes null properties from an object
    public static filterNullProperties(obj:DynamicObject):DynamicObject {
        return Helper.filterPropertiesOfObject(obj, function(prop:any, value:any){
            return !TypeChecker.isNull(value);
        });
    }

    //filters properties of an object by a given filter function
    public static filterPropertiesOfObject(obj:DynamicObject, filterFunc:(propName:any, propValue:any)=>boolean):DynamicObject {
        let result:DynamicObject = {};

        for (let property in obj) {
            if (obj.hasOwnProperty(property) && filterFunc(property, obj.property)) {
                //property belongs to this object, AND passes our filter
                result.property = obj.property;
            }
        }

        return result;
    }

    public static capitalizeFirstLetter(string:string):string {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    public static executeFunctionAfterTimeout(func:(...args:any[]) => void,secs:number) {
        setTimeout(func, secs*1000);
    }

    public static clickAfterSecs(element:JQuery, secs:number):void {
        Helper.executeFunctionAfterTimeout(function () {
            element.trigger('click');
        },secs);
    }

    public static openInNewTab(url:string):void {
        jQuery("<a>").attr("href", url).attr("target", "_blank")[0].click();
    }

    /**
     * Given an array of objects (all the same), with an "id" field,
     * this will fetch given a comparison to another.
     *
     * @param objlist The object list to search
     * @param id The id to compare against
     * @param strictlyCompare Whether to loosely or strictly compare IDs
     */
    public static getLoadedObjFromID(objlist:any[], id:string|number, strictlyCompare:boolean = false):any {
        let intID = parseInt(<any>id);

        for (let i = 0; i < objlist.length; i++) {
            let obj = objlist[i];
            let objID = parseInt(obj.id);
            if(strictlyCompare) {
                if (objID === intID) {
                    return obj;
                }
            } else {
                if (objID == intID) {
                    return obj;
                }
            }
        }
        return null;
    }

    /**
     * Given an array of objects (all the same), with a specified property,
     * this will fetch given a comparison to another.
     *
     * @param objlist The object list to search
     * @param property The property to look for
     * @param valueWanted The value to compare against
     * @param strictlyCompare Whether to loosely or strictly compare the property to the value wanted
     */
    public static getIndexOfObjFromProperty(objlist:any[], property:string, valueWanted:string|number, strictlyCompare:boolean = false):number {
        for (let i = 0; i < objlist.length; i++) {
            let obj = objlist[i];
            let propertyValue = obj[property];

            if(strictlyCompare) {
                if (propertyValue === valueWanted) {
                    return i;
                }
            } else {
                if (propertyValue == valueWanted) {
                    return i;
                }
            }
        }
        return -1;
    }

    /**
     * Get an object from an array, based on an index
     *
     * @param objlist The object list to get an object from
     * @param idx The index to get
     * @param returnLastIfGreater Whether to return the last object if the index is greater than the array allows
     */
    public static getObjFromIndex(objlist:any[], idx:string|number, returnLastIfGreater):any {
        let intIdx = parseInt(<any>idx);

        if (returnLastIfGreater && intIdx >= objlist.length) {
            idx = objlist.length - 1;
        }

        if (idx < objlist.length && intIdx >= 0) {
            return objlist[intIdx];
        } else {
            return null;
        }
    }

    /**
     * Given an array of objects (all the same), with a specified property,
     * this will fetch given a comparison to another.
     *
     * @param objlist The object list to search
     * @param property The property to look for
     * @param valueWanted The value to compare against
     * @param strictlyCompare Whether to loosely or strictly compare the property to the value wanted
     */
    public static getLoadedObjFromProperty(objlist:any[], property:string, valueWanted:string|number, strictlyCompare:boolean = false):any {
        for (let i = 0; i < objlist.length; i++) {
            let obj = objlist[i];
            let propertyValue = obj[property];

            if(strictlyCompare) {
                if (propertyValue === valueWanted) {
                    return obj;
                }
            } else {
                if (propertyValue == valueWanted) {
                    return obj;
                }
            }
        }
        return null;
    }

    /**
     * Removes an object from an array of objects, in-place based on a property
     *
     * @param objectList The array of objects to modify
     * @param property The property to use to find what to remove
     * @param value The value to compare to
     * @param strictlyCompare Whether to loosely or strictly compare the property to the value wanted
     */
    public static deleteLoadedObjFromProperty(objectList:any[], property:string, value:string|number, strictlyCompare:boolean = false):void {
        for (let i = 0; i < objectList.length; i++) {
            let object = objectList[i];

            if(strictlyCompare) {
                if (object[property] === value) {
                    objectList.splice(i, 1);
                }
            } else {
                if (object[property] == value) {
                    objectList.splice(i, 1);
                }
            }
        }
    }

    /**
     * Removes an object from an array of objects, in-place based on a matching function
     *
     * @param objectList The array of objects to modify
     * @param match The function to use to match objects
     * @param onlyFirstOccurrence Whether to match ONLY the first ocurrence, or to match all
     */
    public static deleteLoadedObjWithMatchFunction(objectList:any[], match:(element:any)=>boolean, onlyFirstOccurrence = false):void {
        for (let i = 0; i < objectList.length; i++) {
            let object = objectList[i];
            if (match(object)) {
                objectList.splice(i, 1);
                if(onlyFirstOccurrence) {
                    break;
                }
            }
        }
    }

    /**
     * Updates a given object, based on a property and a value to look for
     *
     * @param objectList The object list to update, in-place
     * @param findProperty The property to compare for each object in the array
     * @param findValue The value to find for the property
     * @param updateProperty The property to change when an object matches
     * @param updateValue The value of the property to update
     * @param strictlyCompare Whether to compare the wanted proerty and value loosely or strictly
     */
    public static updatedLoadedObjFromProperty(objectList:any[], findProperty:string, findValue:string|number, updateProperty:string|number, updateValue:string|number, strictlyCompare:boolean = false):void {
        for (let i = 0; i < objectList.length; i++) {
            let object = objectList[i];
            if (object[findProperty] === findValue) {
                object[updateProperty] = updateValue;
            }
        }
    }

    /**
     * Replaces an object in an object array, with one based ona  given property and value
     *
     * @param objectList The object array to modify, in-place
     * @param findProperty The property to look for
     * @param findValue The value to compare the property to
     * @param newObj The new object to replace matched objects with
     */
    public static replaceLoadedObjFromProperty(objectList:any[], findProperty:string, findValue:string|number, newObj:any):void {
        for (let i = 0; i < objectList.length; i++) {
            let object = objectList[i];
            if (object[findProperty] === findValue) {
                objectList[i] = newObj;
            }
        }
    }

    /**
     * Adds an object to an object array. This SHOULD match the objects in the array,
     * or odd things can happen if you use other functions in this file
     *
     * @param objectList The object list to modify, in-place
     * @param newObj The new object to add
     */
    public static addLoadedObjToList(objectList:any[], newObj:any):void {
        objectList.push(newObj);
    }

    //formats a list of objects that have name/value fields to adds that to a singular object
    //usually used for preparing soem kind of AJAX payload
    //an example of a use case is from jQuery.serializeArray() on a form
    public static getListOfFormattedFieldsFromList(objectList:any[], fieldToUsAsKey:string = "name", fieldtoUseAsValue:string = "value"):DynamicObject {
        let result = {};

        if(!TypeChecker.isNull(objectList)) {
            objectList.forEach(function(obj){
                if(Helper.objectHasProperty(obj, fieldToUsAsKey) && Helper.objectHasProperty(obj, fieldtoUseAsValue)) {
                    (<any>result)[obj[fieldToUsAsKey]] = obj[fieldtoUseAsValue];
                }
            });
        }

        return result;
    }

    /**
     * Remove common "stop words" froma  iven string. Useful for searc parameters and other values.
     * For secure searching, this should be done server-side, but this method is a convenient way to do it client-side
     *
     * @param cleansed_string The string with stop words removed
     */
    public static removeStopWords(cleansed_string:string):string {
        if ((typeof cleansed_string === 'undefined') || (cleansed_string === null) || (cleansed_string === "")) {
            return "";
        }

        let x;
        let y;
        let word;
        let stop_word;
        let regex_str;
        let regex;
        let stop_words = [
            'a', 'about', 'above', 'across', 'after', 'again', 'against', 'all', 'almost', 'alone', 'along', 'already', 'also', 'although', 'always', 'among', 'an', 'and', 'another', 'any', 'anybody', 'anyone', 'anything', 'anywhere', 'are', 'area', 'areas', 'around', 'as', 'ask', 'asked', 'asking', 'asks', 'at', 'away', 'b', 'back', 'backed', 'backing', 'backs', 'be', 'became', 'because', 'become', 'becomes', 'been', 'before', 'began', 'behind', 'being', 'beings', 'best', 'better', 'between', 'big', 'both', 'but', 'by', 'c', 'came', 'can', 'cannot', 'case', 'cases', 'certain', 'certainly', 'clear', 'clearly', 'come', 'could', 'd', 'did', 'differ', 'different', 'differently', 'do', 'does', 'done', 'down', 'down', 'downed', 'downing', 'downs', 'during', 'e', 'each', 'early', 'either', 'end', 'ended', 'ending', 'ends', 'enough', 'even', 'evenly', 'ever', 'every', 'everybody', 'everyone', 'everything', 'everywhere', 'f', 'face', 'faces', 'fact', 'facts', 'far', 'felt', 'few', 'find', 'finds', 'first', 'for', 'four', 'from', 'full', 'fully', 'further', 'furthered', 'furthering', 'furthers', 'g', 'gave', 'general', 'generally', 'get', 'gets', 'give', 'given', 'gives', 'go', 'going', 'good', 'goods', 'got', 'great', 'greater', 'greatest', 'group', 'grouped', 'grouping', 'groups', 'h', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'herself', 'high', 'high', 'high', 'higher', 'highest', 'him', 'himself', 'his', 'how', 'however', 'i', 'if', 'important', 'in', 'interest', 'interested', 'interesting', 'interests', 'into', 'is', 'it', 'its', 'itself', 'j', 'just', 'k', 'keep', 'keeps', 'kind', 'knew', 'know', 'known', 'knows', 'l', 'large', 'largely', 'last', 'later', 'latest', 'least', 'less', 'let', 'lets', 'like', 'likely', 'long', 'longer', 'longest', 'm', 'made', 'make', 'making', 'man', 'many', 'may', 'me', 'member', 'members', 'men', 'might', 'more', 'most', 'mostly', 'mr', 'mrs', 'much', 'must', 'my', 'myself', 'n', 'necessary', 'need', 'needed', 'needing', 'needs', 'never', 'new', 'new', 'newer', 'newest', 'next', 'no', 'nobody', 'non', 'noone', 'not', 'nothing', 'now', 'nowhere', 'number', 'numbers', 'o', 'of', 'off', 'often', 'old', 'older', 'oldest', 'on', 'once', 'one', 'only', 'open', 'opened', 'opening', 'opens', 'or', 'order', 'ordered', 'ordering', 'orders', 'other', 'others', 'our', 'out', 'over', 'p', 'part', 'parted', 'parting', 'parts', 'per', 'perhaps', 'place', 'places', 'point', 'pointed', 'pointing', 'points', 'possible', 'present', 'presented', 'presenting', 'presents', 'problem', 'problems', 'put', 'puts', 'q', 'quite', 'r', 'rather', 'really', 'right', 'right', 'room', 'rooms', 's', 'said', 'same', 'saw', 'say', 'says', 'second', 'seconds', 'see', 'seem', 'seemed', 'seeming', 'seems', 'sees', 'several', 'shall', 'she', 'should', 'show', 'showed', 'showing', 'shows', 'side', 'sides', 'since', 'small', 'smaller', 'smallest', 'so', 'some', 'somebody', 'someone', 'something', 'somewhere', 'state', 'states', 'still', 'still', 'such', 'sure', 't', 'take', 'taken', 'than', 'that', 'the', 'their', 'them', 'then', 'there', 'therefore', 'these', 'they', 'thing', 'things', 'think', 'thinks', 'this', 'those', 'though', 'thought', 'thoughts', 'three', 'through', 'thus', 'to', 'today', 'together', 'too', 'took', 'toward', 'turn', 'turned', 'turning', 'turns', 'two', 'u', 'under', 'until', 'up', 'upon', 'us', 'use', 'used', 'uses', 'v', 'very', 'w', 'want', 'wanted', 'wanting', 'wants', 'was', 'way', 'ways', 'we', 'well', 'wells', 'went', 'were', 'what', 'when', 'where', 'whether', 'which', 'while', 'who', 'whole', 'whose', 'why', 'will', 'with', 'within', 'without', 'work', 'worked', 'working', 'works', 'would', 'x', 'y', 'year', 'years', 'yet', 'you', 'young', 'younger', 'youngest', 'your', 'yours', 'z'
        ];

        // Split out all the individual words in the phrase
        let words = cleansed_string.match(/[^\s]+|\s+[^\s+]$/g);

        // Review all the words
        for (let x=0; x < words.length; x++) {
            // For each word, check all the stop words
            for (let y=0; y < stop_words.length; y++) {
                // Get the current word
                word = words[x].replace(/\s+|[^a-z]+/ig, "");   // Trim the word and remove non-alpha

                // Get the stop word
                stop_word = stop_words[y];

                // If the word matches the stop word, remove it from the keywords
                if (word.toLowerCase() === stop_word) {
                    // Build the regex
                    regex_str = "^\\s*" + stop_word + "\\s*$";      // Only word
                    regex_str += "|^\\s*" + stop_word + "\\s+";     // First word
                    regex_str += "|\\s+" + stop_word + "\\s*$";     // Last word
                    regex_str += "|\\s+" + stop_word + "\\s+";      // Word somewhere in the middle
                    regex = new RegExp(regex_str, "ig");

                    // Remove the word from the keywords
                    cleansed_string = cleansed_string.replace(regex, " ");
                }
            }
        }
        return cleansed_string.replace(/^\s+|\s+$/g, "");
    }

    /**
     * Removes duplicates from a given array
     *
     * @param array The array to remove duplicates from
     */
    public static uniqueArray(array:any[]):any[] {
        let result = [];
        jQuery.each(array, function (i, e) {
            if (jQuery.inArray(e, result) === -1) {
                result.push(e);
            }
        });
        return result;
    }

    /**
     * A relatively fast way to remove duplicates from an array of numbers.
     * Sorts the array, and based on the order, and indices, is able to find the right number to remove
     *
     * @param arr The array to remove duplicates from
     */
    public static uniquePrimitives(arr:number[]):number[]{
        arr.sort();
        for(var i=1;i<arr.length;){
            if(arr[i-1]==arr[i]){
                arr.splice(i,1);
            } else {
                i++;
            }
        }
        return arr;
    }

    /**
     * Removes duplicate objects from an array of objects, given a compare function
     * @param a The array of objects to make unique
     * @param compareFunc The comparison function between 2 object
     */
    public static uniqueObjs(a:any[], compareFunc:(elementA:any, elementB:any)=>number):any[]{
        a.sort(compareFunc);
        for(var i=1;i<a.length;){
            if( compareFunc(a[i-1],a[i]) === 0){
                a.splice(i, 1);
            } else {
                i++;
            }
        }
        return a;
    }

    /**
     * Removes an element, by instance/value, from an array, in-place
     *
     * @param array The array to modify
     * @param element The object to look for in the array, and remove
     */
    public static removeElementFromArray(array:any[], element:any):void {
        let index = array.indexOf(element);

        if (index !== -1) {
            array.splice(index, 1);
        }
    }

    /**
     * Removes an element from an array, based on index
     *
     * @param array The array to modify
     * @param idx The index to remove an element from
     */
    public static removeIndexFromArray(array:any[], idx:number) {
        if ((idx>-1) && (idx<=array.length)) {
            array.splice(idx, 1);//modifies array in place
        }
    }

    public static disableButton(button:JQuery):void {
        button.addClass("disabled");
        button.attr("disabled", "disabled");
    }

    public static enableButton(button:JQuery):void {
        button.removeClass("disabled");
        button.removeAttr("disabled");
    }

    public static readOnlyField(field:JQuery):void {
        field.addClass("disabled");
        field.attr("disabled","disabled");
    }
    public static editableField(field:JQuery):void {
        field.removeClass("disabled");
        field.removeAttr("disabled");
    }

    /**
     * Rotates an element, via CSS, to the given angle "rot"
     *
     * @param $elem The HTML jQuery element to rotate
     * @param rot The degrees to rotate the element by
     */
    public static rotateElement($elem:JQuery, rot:number):void {
        if (typeof rot === 'undefined' || rot === null) {
            rot = 0;
        }

        $elem.css("transform", "rotate("+rot+"deg)");
    }

    /**
     * A function to toggle the rotation for.
     * The "target" rotation degrees is specified by the data attribute "toggle-rotation" on the element.
     * This and 0 degrees are alternated between.
     *
     * @param $elem The element to toggle rotation for
     */
    public static toggleRotation($elem:JQuery):void {
        let dataRotation = $elem.data("toggle-rotation");
        let dataRotated = $elem.data("rotation-toggled");
        if (!dataRotation) {
            return;
        } else {
            dataRotated = false;
        }

        if (dataRotated) {
            Helper.rotateElement($elem, 0);
        } else {
            Helper.rotateElement($elem, dataRotation);
        }
        $elem.data("rotation-toggled", !dataRotated);
    }

    public static elementsAreDescendants(parent:JQuery, childToCheck:JQuery, allAreDescendants:boolean) {
        //if not provided / not boolean, default to false
        if (TypeChecker.isUndefined(allAreDescendants) || !TypeChecker.isBoolean(allAreDescendants)) {
            allAreDescendants = false;
        }

        if (TypeChecker.isEmpty(parent) || TypeChecker.isEmpty(childToCheck)) {
            return false;
        } else {
            let result = false;
            let breakLoop = false;
            parent.each(function () {
                let $parent = jQuery(this);
                childToCheck.each(function(){
                    let $child = jQuery(this);
                    result = result || jQuery.contains($parent[0], $child[0]);
                    if(allAreDescendants && !result) {
                        breakLoop = true;
                    }

                    if (breakLoop) {
                        return false;
                    }
                });

                if (breakLoop) {
                    return false;
                }
            });

            return result;
        }
    }

    //this does NOT get values from radios that are unchecked, so it's best to default a value on a radio button (or use a checkbox)
    public static getFormValuesObj($form:JQuery):any {
        let formObj = {};
        let inputs = $form.serializeArray();
        jQuery.each(inputs, function (i, input) {
            formObj[input.name] = input.value;
        });
        return formObj;
    }

     /**
     * Creates / appends FormData obtained from the given form element, and returns the resulting object
     *
     * @param data any kind of data to add to the FormData (array, object, or a primitive)
     * @param formData The existing FormData, or null if none is to be provided
     * @param key The key to add "data" using
     *
     * @return The resulting FormData
     */
    public static createFormData(data:any, formData:FormData = null, key:string = ""):FormData {
        if(TypeChecker.isNull(formData)) {
            formData = new FormData();
        }

        if((typeof data === 'object' && data !== null) || Array.isArray(data)) {
            for ( let i in data ) {
                if ((typeof data[i] === 'object' && data[i] !== null) || Array.isArray(data[i])) {
                    Helper.createFormData(formData, data[i], key + '[' + i + ']');
                } else {
                    formData.append(key + '[' + i + ']', data[i]);
                }
            }
        } else {
            formData.append(key, data);
        }

        return formData;
    }

    public static capitalize(string:string):string {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    /**
     * Gets the DATA properties of an object only (not functions)
     *
     * @param obj The object to get data properties of
     */
    public static getDataPropertiesOnly(obj:any):any {
        let output = {};
        for (let property in obj) {
            if (obj.hasOwnProperty(property) && (typeof obj[property] !== 'function')) {
                output[property] = obj[property];
            }
        }

        return output;
    }


    public static objectHasProperty(obj:any, propertyName:string):boolean {
        return obj.hasOwnProperty(propertyName);
    }

    public static removePropertyFromObject(obj:any, propertyName:string):any {
        let resultObj = jQuery.extend(true, {}, obj);//copy container into new object (deep copy)
        if (TypeChecker.isString(propertyName)) {
            delete resultObj[propertyName];
        }

        return resultObj;
    }

    public static hide($target:JQuery) {
        $target.addClass('hidden');
        $target.hide();
    }

    public static show($target:JQuery, showInlineBlock:boolean = false) {
        $target.removeClass('hidden');
        if(showInlineBlock) {
            $target.css('display', 'inline-block');
        } else {
            $target.show();
        }
    }

    /* Window Unload Helpers */
    //accepts a function with NO params, which returns void
    public static AddUnloadFunction(func:() => void):void {
        let idx = Helper.windowUnloadFunctionsToCall.indexOf(func);
        if (idx === -1) {
            Helper.windowUnloadFunctionsToCall.push(func);
        } else {
            console.warn("The function to add to window unload is already added.");
        }
    }

    public static RemoveUnloadFunction(func:() => void):void {
        let idx = Helper.windowUnloadFunctionsToCall.indexOf(func);
        if (idx !== -1) {
            Helper.windowUnloadFunctionsToCall.splice(idx, 1);
        } else {
            console.warn("The function to remove from window unload has not been added.");
        }
    }

    public static GetPropertiesOfObjectOnly(obj:any) {
        let output = {};
        for (let property in obj) {
            if (obj.hasOwnProperty(property) && (typeof obj[property] !== 'function')) {
                output[property] = obj[property];
            }
        }

        return output;
    }

    //A function to call a function parameter if the function is NOT null/undefined
    //Will also accept a parameter for the function, OR a parameter list
    //the function type can accept ANY number of args (even none/undefined) and return a variety of things
    public static ExecuteFunctionIfDefined(func:(...args: any[]) => any, args:any) {
        if ((func !== null) && (typeof func !== 'undefined') && (typeof func === 'function')) {
            if (args) {
                if ((typeof args === 'object') && (args.constructor === Array)) {
                    //forces the "this" reference of a function to the global instance, as well as expanding the list of arguments
                    //eg: passing in [1,2,3] for args will be the same as: func(1,2,3)
                    func.apply(null, args);

                } else {//must be single value then
                    func(args);
                }
            } else {
                func();
            }
        }
    }

    public static GetDataIfPresent(element:JQuery, dataName:string, dataObjectExpected:any = null) {//gets data from an element if valid (and if a value is passed in 'dataObjectExpected' object type is checked), or returns null of invalid
        let data = null;
        if (element.data().hasOwnProperty(dataName)) {
            data = element.data(dataName);
            let compareToType = (typeof dataObjectExpected !== 'undefined') && (dataObjectExpected !== null);

            if ((typeof data === 'undefined') || (data === null) && (!compareToType || (data.constructor !== dataObjectExpected.constructor))) {
                data = null;
            }

        }

        return data;
    }

    public static FunctionDefined(fn) {
        return ((fn !== null) && (typeof fn !== 'undefined') && (typeof fn === 'function'));
    }

    /*
    The progress bar element that is expected:

    <div class="progress">
        <div class="progress-bar" role="progressbar" style="width: 0" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
    </div>

    OR

    <div class="progress">
        <div class="progress-bar" role="progressbar" style="width: 0" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">

        </div>
    </div>
     */
    public static uploadFileForm(
        form:JQuery,
        url:string,
        successCallback:(data:any)=>void = AJAX.standardAjaxSuccess,
        errorCallback:(jqXHR, textStatus, errorThrown)=>void = AJAX.standardAjaxError,
        onCompleteCallback:(jqXHR, textStatus:string)=>void = null,
        onUploadProgressCallback:(evt:ProgressEvent)=>void = null,
        filesParamName:string = "files",
        extraPayloadFields?:(fd: FormData)=>void,
        progressBar?:JQuery,
        onRequestProgressCallback:(evt:ProgressEvent)=>void = null,
        debug:boolean = false
    ):JQuery.Promise<any> {
        if(filesParamName === "") {
            filesParamName = "files";
        }

        let fd = new FormData();
        let hasProgressBar = !TypeChecker.isUndefined(progressBar) && progressBar.hasClass('progress-bar');
        let percentDiv = hasProgressBar ? progressBar.find('.progress-percent') : null;
        let hasPercentDiv = hasProgressBar && (percentDiv.length > 0);

        if(hasProgressBar) {
            progressBar.width("0");
            Helper.show(progressBar.parent());
        }

        // Loop through each data and create an array file[] containing our files data.

        jQuery.each(form.find("input[type=file]"), function(i, input) {
            jQuery.each((<any>input).files, function (j, file) {
                fd.append(filesParamName+'['+(<any>j)+']', file);
            });
        });

        Helper.ExecuteFunctionIfDefined(extraPayloadFields, fd);

        return jQuery.ajax({
            type: 'POST',
            url: url,
            xhr: function() {
                let xhr = null;//will be instantiated below
                if ((<any>window).XMLHttpRequest) {
                    xhr = new XMLHttpRequest();

                } else {
                    xhr = new ActiveXObject("Microsoft.XMLHTTP");
                }

                xhr.upload.addEventListener("progress", function(evt: ProgressEvent) {
                    if(debug) {
                        let datetime = new Date();
                    }

                    if(evt.lengthComputable) {
                        let percentWidth = evt.loaded/evt.total;
                        let finalWidth = Math.floor(percentWidth*100);
                        if(hasProgressBar) {
                            progressBar.animate(
                                {width: finalWidth + '%'},
                                {
                                    duration: 100,
                                    step: function (now, fx) {
                                        if (fx.prop == 'width') {
                                            let progressText = Math.round(now * 100) / 100 + '%';

                                            if(hasPercentDiv) {
                                                percentDiv.html(progressText);
                                            } else {
                                                jQuery(this).html(progressText);
                                            }
                                        }
                                    }
                                }
                            );
                        }
                    }

                    Helper.ExecuteFunctionIfDefined(onUploadProgressCallback, evt);
                }, false);

                xhr.addEventListener("progress", function(evt: ProgressEvent) {
                    Helper.ExecuteFunctionIfDefined(onRequestProgressCallback, evt);
                }, false);

                return xhr;
            },
            data: fd,
            contentType: false,
            processData: false,
            success: successCallback,
            error: errorCallback,
            complete: function(jqXHR, textStatus:string){
                if(!TypeChecker.isUndefined(progressBar)) {
                    Helper.hide(progressBar.parent());
                }
                Helper.ExecuteFunctionIfDefined(onCompleteCallback, [jqXHR, textStatus]);
            }
        }) as JQuery.Promise<any>;
    }

    public static formatFileSize(bytes:number):string {
        let bytesInt = parseInt(<any>bytes, 10);//because we are strongly typed here, we can "force" a number through to an int
        let num = numeral(bytes);
        let result = "0B";

        if(bytesInt > 0) {
            result = num.format('0.0b');
        }

        return result;
    }

    public static getUrlVars(url:string = '') {
        let vars = {};
        if(!TypeChecker.isUndefined(url) && (url !== '')){
            let parts = url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value):string {
                vars[key] = value;
                return m;
            });
        }

        return vars;
    }

    public static getUrlParam(url:string = '', parameter:string = '', defaultvalue:string = '', useCurrentURL:boolean = false){
        if(useCurrentURL === true) {
            url = window.location.href;
        }

        let urlparameter = defaultvalue;

        if(url.indexOf(parameter) > -1){
            urlparameter = Helper.getUrlVars(url)[parameter];
            if(TypeChecker.isUndefined(urlparameter)) {
                urlparameter = '';
            }
        }

        return urlparameter;
    }

    public static getFilenameFromURL(url:string=""):string {
        if(!TypeChecker.isNull(url) && url !== "") {
            return url.substring(url.lastIndexOf('/')+1);
        } else {
            return "";
        }
    }

    public static contains(haystack:string|string[], needle:string):boolean {
        let found = false;
        if(!TypeChecker.isNull(haystack) && !TypeChecker.isNull(needle)) {
            found = (haystack.indexOf(needle) !== -1);
        }

        return found;
    }

    public static downloadFileAsBlob(data, fileName, type="text/plain") {
        // Create an invisible A element
        const a = document.createElement("a");
        a.style.display = "none";
        document.body.appendChild(a);

        // Set the HREF to a Blob representation of the data to be downloaded
        a.href = window.URL.createObjectURL(
            new Blob([data], { type })
        );

        // Use download attribute to set set desired file name
        a.setAttribute("download", fileName);

        // Trigger the download by simulating click
        a.click();

        // Cleanup
        window.URL.revokeObjectURL(a.href);
        document.body.removeChild(a);
    }

    public static downloadURI(uri, name) {
        var link = document.createElement("a");
        link.style.display = "none";
        document.body.appendChild(link);

        link.download = name;
        link.href = uri;
        link.click();

        window.URL.revokeObjectURL(link.href);
        document.body.removeChild(link);
    }

    public static basicPrint(url:string){
        if(TypeChecker.isEmpty(url)) {
            return;
        }

        let w=window.open(url);
        w.print();
        w.close();
    }

    public static formatEscapeFilename(filename:string = "") {
        return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    }

    public static containsMultiple(haystack:string|string[], needles:string[], containsAll:boolean = false):boolean {
        let found = false;
        if(!TypeChecker.isNull(haystack) && !TypeChecker.isNull(needles)) {
            //use try/catch as a "break" as break isn't allowed in the "forEach" function
            try {
                needles.forEach(function (needle) {
                    found = (haystack.indexOf(needle) !== -1);
                    if(containsAll && !found) {
                        throw "Break: Break early as needle not found (and all required)";
                    }
                });
            } catch(e) {}
        }

        return found;
    }

    public static unique(arr:any[]):any[] {
        function onlyUnique(value, index, self) {
            return self.indexOf(value) === index;
        }

        return arr.filter(onlyUnique);
    }

    public static joinArray(arr:any[], delimiter:string = ",", mappingFunc:(any)=>string = null):string{
        let mapped = arr;
        if(mappingFunc !== null) {
            mapped = arr.map(mappingFunc);
        }

        return mapped.join(delimiter);
    }

    public static FindInArray(arr:any[], needle:CheckFunction|string|number):number|number[]|boolean {
        let result = false;
        for(let i=0;i<arr.length;i++) {
            let element = arr[i];
            if((TypeChecker.isFunction(needle) && (<CheckFunction>(<any>needle))(element)) || element == needle) {
                if(TypeChecker.isArray(result)) {
                    (<any[]>(<any>result)).push(i);
                } else if (TypeChecker.isNumber(result)){
                    (<any>result) = [result, i];
                } else {
                    (<any>result) = i;
                }
            }
        }

        return result;
    }

    //returns all elements in array1 that are NOT in array2
    /**
     * Returns the difference of 2 arrays (elements in array1, that ar eNOT in array2)
     * @param array1
     * @param array2
     *
     */
    public static Diff(array1:any[], array2:any[]):any[] {
        return array1.filter(function(i) {
            return array2.indexOf(i) < 0;
        });
    }

    /**
     * Ensures every element of an array is fed through parseInt
     *
     * @param arr The array to parse
     */
    public static parseIntArray(arr:string[]|number[]):number[] {
        let result = [];
        (<any[]>arr).forEach(function(element){
            result.push(parseInt(element, 10));
        });
        return result;
    }

    /**
     * Add custom jQuery validate methods
     *
     * @param jquery
     */
    public static addCustomValidators(jquery:JQueryStatic) {
        if(!TypeChecker.isUndefined((<any>jquery).fn.validate)) {
            /* Validation Helpers */
            // override jquery validate plugin defaults
            (<any>jquery).validator.setDefaults({
                highlight: function (element) {
                    jQueryModule(element).closest('.form-group').addClass('has-error');
                },
                unhighlight: function (element) {
                    jQueryModule(element).closest('.form-group').removeClass('has-error');
                },
                errorElement: 'span',
                errorClass: 'help-block',
                errorPlacement: function (error, element) {
                    let formGroupParent = jQueryModule(element).parents(".form-group");
                    let errorDestination = formGroupParent.find(".errorPlacement");

                    if (element.parent('.input-group').length) {
                        error.insertAfter(element.parent());
                    } if (errorDestination.length) {
                        errorDestination.first().append(error);
                    } else {
                        error.insertAfter(element);
                    }
                }
            });

            (<any>jquery).validator.addMethod("basicDate", function (value, element) {
                let validateDate = function(testdate, format) {
                    let date_regex = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/;
                    return date_regex.test(testdate);
                };

                return this.optional(element) || validateDate(value, 'MM/DD/YYYY');
            },
                "Please enter a valid date."
            );

            (<any>jquery).validator.addMethod("optionSelected", function (value, element) {
                let isNumber = TypeChecker.stringIsInteger(value);
                value = isNumber ? parseInt(value) : value;

                let optional = this.optional(element);
                let notEmpty = (value > -1) || (!isNumber && (value !== null) && (typeof value !== 'undefined'));
                return optional || notEmpty;
            },
                "Please select an option."
            );

            (<any>jquery).validator.addMethod('greaterThan', function (value, el, param) {
                let optional = this.optional(el);
                return optional || (value > param);
            },
                "Please enter a value greater than {0}."
            );

            (<any>jquery).validator.addMethod("minlengthIfEntered", function (value, element, param) {
                let optional = this.optional(element);
                return optional || ((value.trim().length === 0) || (value.trim().length >= param));
            },
                "A value entered must be greater than {0} characters."
            );

            (<any>jquery).validator.addMethod("lengthRangeIfRequired", function (value, element, params) {
                if ((typeof params.isRequired === 'undefined') || (typeof params.min === 'undefined') || (typeof params.max === 'undefined')) {
                    return false;
                } else {
                    let isRequiredVal = (typeof params.isRequired === 'function') ? params.isRequired() : params.isRequired;
                    let valid = ((!isRequiredVal) || ((value.length >= params.min) && (value.length <= params.max)));
                    return valid;
                }
            },
                "Please enter input with at least {min} characters, and at max {max} characters."
            );

            (<any>jquery).validator.addMethod("optionSelectedIfRequired", function (value, element, isRequired) {
                let filteredVal = parseInt(value);
                filteredVal = (isNaN(filteredVal)) ? -1 : filteredVal;

                let isRequiredVal = (typeof isRequired === 'function') ? isRequired() : isRequired;

                return ((!isRequiredVal) || ((filteredVal >= 0)) );
            },
                "Please select an option."
            );

            (<any>jquery).validator.addMethod("validURL", function (value, element) {
                let validURL = TypeChecker.isValidURL(value);
                return this.optional(element) || validURL;
            },
                "The entered URL is not valid."
            );
        }
    }

    public static makeElementIDsUnique(elements:JQuery, suffix:string = "") {
        if(!TypeChecker.isUndefined(elements) && elements.length > 0) {
            if(suffix === "") {
                suffix = new Date().getTime().toString(10);
            }

            elements.each(function (idx, el) {
                let element = jQuery(el);
                let forProp = element.prop('for');
                let idProp = element.prop('id');
                let hasForProp = !TypeChecker.isUndefined(forProp);
                let hasIdProp = !TypeChecker.isUndefined(idProp);

                if (hasForProp && forProp) {
                    element.prop('for', forProp + suffix);
                }

                if (hasIdProp && idProp) {
                    element.prop('id', idProp + suffix);
                }
            });
        }
    }

    public static makeRecursiveElementIDsUnique(elements:JQuery, suffix:string = "") {
        if(!TypeChecker.isUndefined(elements) && elements.length > 0) {
            if(suffix === "") {
                suffix = new Date().getTime().toString(10);
            }

            elements.each(function (idx, el) {
                let element = jQuery(el);
                Helper.makeElementIDsUnique(element, suffix);

                element.children().each(function () {
                    let childElement = jQuery(this);
                    Helper.makeRecursiveElementIDsUnique(childElement, suffix);
                });
            });
        }
    }

    public static openNewWindow(url:string):boolean {
        let win = window.open(url, '_blank');
        if (win) {
            //Browser has allowed it to be opened
            win.focus();
            return true;
        } else {
            //Browser has blocked it
            alert('Opening has been blocked by your popup blocker.');
            return false;
        }
    }

    public static scrollToElement(selector:string, time:number) {
        jQueryModule('html, body').animate({
            scrollTop: jQueryModule(selector).offset().top
        }, time);
    }

    //converts text to its html entity equivalent
    public static encodeStringToHTML(str:string):string {
        if(str) {
            return jQueryModule("<div />").text(str).html();
        } else {
            return "";
        }
    }

    /**
     * Gets the current site "base url" using "location.href"
     */
    public static getBaseSiteUrl():string {
        let pathArray = location.href.split('/');
        let protocol = pathArray[0];
        let host = pathArray[2];
        let url = protocol + '//' + host;

        return url;
    }

    //if url is empty, it uses current url
    public static getTwitterShareButtonHTML(urlToShare:string,existingText:string = ""):string {
        if(TypeChecker.isNull(urlToShare) || TypeChecker.isUndefined(urlToShare) || (urlToShare=="")) {
            urlToShare = document.location.href;
        }

        let textEscaped = Helper.encodeStringToHTML(existingText);
        let html = '<div class="tweetLink shareLink">\
                <i class="fa fa-twitter" aria-hidden="true"></i>\
                <a href="https://twitter.com/intent/tweet?text='+textEscaped+'&url='+urlToShare+'"\
                onclick="javascript:window.open(this.href, \'\', \'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600\');return false;"\
                target="_blank" title="Tweet This!">Tweet This!</a>\
              </div>';
        return html;
    }

    //if url is empty, it uses current url
    public static getEMailShareButtonHTML(urlToShare, title, bodyText) {
        if(TypeChecker.isNull(urlToShare) || TypeChecker.isUndefined(urlToShare) || (urlToShare=="")) {
            urlToShare = document.location.href;
        }

        bodyText = Helper.encodeStringToHTML(bodyText);
        title = Helper.encodeStringToHTML(title);

        let html = '<div class="emailLink shareLink">\
                <i class="fa fa-envelope" aria-hidden="true"></i>\
                <a href="mailto:?subject=Hellow%20World%20-%20'+title+'&body='+bodyText+urlToShare+'">Email This!</a>\
              </div>';
        return html;
    }

    public static getFacebookShareButtonHTML(urlToShare:string, title:string):string {
        if(TypeChecker.isNull(urlToShare) || TypeChecker.isUndefined(urlToShare) || (urlToShare=="")) {
            urlToShare = document.location.href;
        }

        let fhtml = '\
        <div class="fbShareLink shareLink">\
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">\
               <path fill="#ffffff" fill-rule="evenodd" d="M8 14H3.667C2.733 13.9 2 13.167 2 12.233V3.667A1.65 1.65 0 0 1\
                 3.667 2h8.666A1.65 1.65 0 0 1 14 3.667v8.566c0 .934-.733\
                 1.667-1.667\
                 1.767H10v-3.967h1.3l.7-2.066h-2V6.933c0-.466.167-.9.867-.9H12v-1.8c.033\
                 0-.933-.266-1.533-.266-1.267 0-2.434.7-2.467\
                 2.133v1.867H6v2.066h2V14z">\
               </path>\
             </svg>\
           <a href="https://www.facebook.com/sharer/sharer.php?u='+urlToShare+'&t='+title+'"\
           onclick="javascript:window.open(this.href, \'\', \'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600\');return false;"\
           target="_blank" title="Share on Facebook">\
            <span>Share This!</span>\
           </a>\
        </div>';
        return fhtml;
    }

    public static getRedditShareButtonHTML(urlToShare:string):string {
        if(TypeChecker.isNull(urlToShare) || TypeChecker.isUndefined(urlToShare) || (urlToShare=="")) {
            urlToShare = document.location.href;
        }

        let rhtml = '\
        <div class="redditShareLink shareLink">\
          <i class="fa fa-reddit" aria-hidden="true"></i>\
          <a href="https://www.reddit.com/submit?url='+urlToShare+'">\
            Reddit This!\
          </a>\
        </div>';
        return rhtml;
    }

    public static stringsSimilar(s:string, s2:string):boolean {
        let similar = (s.toLowerCase().indexOf(s2) != -1);
        similar = similar || (Helper.getEditDistance(s.toLowerCase(),s2.toLowerCase() ) < 3);
        return similar;
    }

    // Compute the edit distance between the two given strings
    public static getEditDistance(a:string, b:string):number {
        if(TypeChecker.isUndefined(a) || TypeChecker.isNull(a) || TypeChecker.isUndefined(b) || TypeChecker.isNull(b) || ((a === "")&&(b === ""))) {
            return 0;
        }

        if (a.length === 0) {
            return b.length;
        }

        if (b.length === 0) {
            return a.length;
        }

        let matrix = [];

        // increment along the first column of each row
        let i;
        for (i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }

        // increment each column in the first row
        let j;
        for (j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        // Fill in the rest of the matrix
        for (i = 1; i <= b.length; i++) {
            for (j = 1; j <= a.length; j++) {
                if (b.charAt(i-1) == a.charAt(j-1)) {
                    matrix[i][j] = matrix[i-1][j-1];
                } else {
                    matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                        Math.min(matrix[i][j-1] + 1, // insertion
                            matrix[i-1][j] + 1)); // deletion
                }
            }
        }

        return matrix[b.length][a.length];
    }

    public static getUrlParameter(sParam:string):string|null {
        let sPageURL = decodeURIComponent(window.location.search.substring(1));
        let sURLVariables = sPageURL.split('&');
        let sParameterName:string[] = [];
        for(let i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if(sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? "" : sParameterName[1];
            }
        }

        return null;
    }

    public static generateUUID():string { // Public Domain/MIT
        let d = new Date().getTime();//Timestamp
        let d2 = (performance && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16;//random number between 0 and 16
            if(d > 0){//Use timestamp until depleted
                r = (d + r)%16 | 0;
                d = Math.floor(d/16);
            } else {//Use microseconds since page-load if supported
                r = (d2 + r)%16 | 0;
                d2 = Math.floor(d2/16);
            }
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }
}
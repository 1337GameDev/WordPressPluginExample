/// <reference types="jquery" />
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "jquery", "./TypeChecker", "./AJAX", "numeral"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var jQueryModule = require("jquery");
    var TypeChecker_1 = require("./TypeChecker");
    var AJAX_1 = require("./AJAX");
    var numeral = require("numeral");
    var Helper = /** @class */ (function () {
        function Helper() {
        }
        //merges object 2 INTO object 1 (and returns a copy of that merge)
        Helper.mergeObjects = function (obj1, obj2, excludeInvalidValues) {
            if (excludeInvalidValues === void 0) { excludeInvalidValues = true; }
            var result = {};
            var dest = obj1;
            var src = obj2;
            if (excludeInvalidValues) {
                src = Helper.filterInvalidProperties(src);
            }
            result = jQueryModule.extend({}, dest, src);
            return result;
        };
        /**
         * Uses stringify and parse to convert a javascipt object to a string and back.
         * This can be expensive, but shouldn't be done too often.
         *
         * @param obj The object to deep copy
         */
        Helper.deepCopyObject = function (obj) {
            if (obj === void 0) { obj = {}; }
            return JSON.parse(JSON.stringify(obj));
        };
        //use this function when handling an element in the DOM yet (as jQuery data handles DOM elements).
        //if you use this on elements created as jquery elements (not in the DOM yet) then the data won't be available when added to the DOM
        Helper.addAllPropertiesAsData = function ($object, data) {
            for (var name_1 in data) {
                if (data.hasOwnProperty(name_1)) {
                    $object.data(name_1.toLowerCase(), data[name_1]);
                }
            }
        };
        //use this function when handling an element NOT in the DOM yet (as jQuery data handles DOM elements)
        Helper.addAllPropertiesAsDataAttr = function ($object, data) {
            for (var name_2 in data) {
                if (data.hasOwnProperty(name_2)) {
                    $object.attr("data-" + name_2.toLowerCase(), data[name_2]);
                }
            }
        };
        //removes null and undefined properties from an object
        Helper.filterInvalidProperties = function (obj) {
            return Helper.filterPropertiesOfObject(obj, function (prop, value) {
                return !TypeChecker_1.TypeChecker.isUndefined(value) && !TypeChecker_1.TypeChecker.isNull(value);
            });
        };
        //removes undefined properties from an object
        Helper.filterUndefinedProperties = function (obj) {
            return Helper.filterPropertiesOfObject(obj, function (prop, value) {
                return !TypeChecker_1.TypeChecker.isUndefined(value);
            });
        };
        //removes null properties from an object
        Helper.filterNullProperties = function (obj) {
            return Helper.filterPropertiesOfObject(obj, function (prop, value) {
                return !TypeChecker_1.TypeChecker.isNull(value);
            });
        };
        //filters properties of an object by a given filter function
        Helper.filterPropertiesOfObject = function (obj, filterFunc) {
            var result = {};
            for (var property in obj) {
                if (obj.hasOwnProperty(property) && filterFunc(property, obj.property)) {
                    //property belongs to this object, AND passes our filter
                    result.property = obj.property;
                }
            }
            return result;
        };
        Helper.capitalizeFirstLetter = function (string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        };
        Helper.executeFunctionAfterTimeout = function (func, secs) {
            setTimeout(func, secs * 1000);
        };
        Helper.clickAfterSecs = function (element, secs) {
            Helper.executeFunctionAfterTimeout(function () {
                element.trigger('click');
            }, secs);
        };
        Helper.openInNewTab = function (url) {
            jQuery("<a>").attr("href", url).attr("target", "_blank")[0].click();
        };
        /**
         * Given an array of objects (all the same), with an "id" field,
         * this will fetch given a comparison to another.
         *
         * @param objlist The object list to search
         * @param id The id to compare against
         * @param strictlyCompare Whether to loosely or strictly compare IDs
         */
        Helper.getLoadedObjFromID = function (objlist, id, strictlyCompare) {
            if (strictlyCompare === void 0) { strictlyCompare = false; }
            var intID = parseInt(id);
            for (var i = 0; i < objlist.length; i++) {
                var obj = objlist[i];
                var objID = parseInt(obj.id);
                if (strictlyCompare) {
                    if (objID === intID) {
                        return obj;
                    }
                }
                else {
                    if (objID == intID) {
                        return obj;
                    }
                }
            }
            return null;
        };
        /**
         * Given an array of objects (all the same), with a specified property,
         * this will fetch given a comparison to another.
         *
         * @param objlist The object list to search
         * @param property The property to look for
         * @param valueWanted The value to compare against
         * @param strictlyCompare Whether to loosely or strictly compare the property to the value wanted
         */
        Helper.getIndexOfObjFromProperty = function (objlist, property, valueWanted, strictlyCompare) {
            if (strictlyCompare === void 0) { strictlyCompare = false; }
            for (var i = 0; i < objlist.length; i++) {
                var obj = objlist[i];
                var propertyValue = obj[property];
                if (strictlyCompare) {
                    if (propertyValue === valueWanted) {
                        return i;
                    }
                }
                else {
                    if (propertyValue == valueWanted) {
                        return i;
                    }
                }
            }
            return -1;
        };
        /**
         * Get an object from an array, based on an index
         *
         * @param objlist The object list to get an object from
         * @param idx The index to get
         * @param returnLastIfGreater Whether to return the last object if the index is greater than the array allows
         */
        Helper.getObjFromIndex = function (objlist, idx, returnLastIfGreater) {
            var intIdx = parseInt(idx);
            if (returnLastIfGreater && intIdx >= objlist.length) {
                idx = objlist.length - 1;
            }
            if (idx < objlist.length && intIdx >= 0) {
                return objlist[intIdx];
            }
            else {
                return null;
            }
        };
        /**
         * Given an array of objects (all the same), with a specified property,
         * this will fetch given a comparison to another.
         *
         * @param objlist The object list to search
         * @param property The property to look for
         * @param valueWanted The value to compare against
         * @param strictlyCompare Whether to loosely or strictly compare the property to the value wanted
         */
        Helper.getLoadedObjFromProperty = function (objlist, property, valueWanted, strictlyCompare) {
            if (strictlyCompare === void 0) { strictlyCompare = false; }
            for (var i = 0; i < objlist.length; i++) {
                var obj = objlist[i];
                var propertyValue = obj[property];
                if (strictlyCompare) {
                    if (propertyValue === valueWanted) {
                        return obj;
                    }
                }
                else {
                    if (propertyValue == valueWanted) {
                        return obj;
                    }
                }
            }
            return null;
        };
        /**
         * Removes an object from an array of objects, in-place based on a property
         *
         * @param objectList The array of objects to modify
         * @param property The property to use to find what to remove
         * @param value The value to compare to
         * @param strictlyCompare Whether to loosely or strictly compare the property to the value wanted
         */
        Helper.deleteLoadedObjFromProperty = function (objectList, property, value, strictlyCompare) {
            if (strictlyCompare === void 0) { strictlyCompare = false; }
            for (var i = 0; i < objectList.length; i++) {
                var object = objectList[i];
                if (strictlyCompare) {
                    if (object[property] === value) {
                        objectList.splice(i, 1);
                    }
                }
                else {
                    if (object[property] == value) {
                        objectList.splice(i, 1);
                    }
                }
            }
        };
        /**
         * Removes an object from an array of objects, in-place based on a matching function
         *
         * @param objectList The array of objects to modify
         * @param match The function to use to match objects
         * @param onlyFirstOccurrence Whether to match ONLY the first ocurrence, or to match all
         */
        Helper.deleteLoadedObjWithMatchFunction = function (objectList, match, onlyFirstOccurrence) {
            if (onlyFirstOccurrence === void 0) { onlyFirstOccurrence = false; }
            for (var i = 0; i < objectList.length; i++) {
                var object = objectList[i];
                if (match(object)) {
                    objectList.splice(i, 1);
                    if (onlyFirstOccurrence) {
                        break;
                    }
                }
            }
        };
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
        Helper.updatedLoadedObjFromProperty = function (objectList, findProperty, findValue, updateProperty, updateValue, strictlyCompare) {
            if (strictlyCompare === void 0) { strictlyCompare = false; }
            for (var i = 0; i < objectList.length; i++) {
                var object = objectList[i];
                if (object[findProperty] === findValue) {
                    object[updateProperty] = updateValue;
                }
            }
        };
        /**
         * Replaces an object in an object array, with one based ona  given property and value
         *
         * @param objectList The object array to modify, in-place
         * @param findProperty The property to look for
         * @param findValue The value to compare the property to
         * @param newObj The new object to replace matched objects with
         */
        Helper.replaceLoadedObjFromProperty = function (objectList, findProperty, findValue, newObj) {
            for (var i = 0; i < objectList.length; i++) {
                var object = objectList[i];
                if (object[findProperty] === findValue) {
                    objectList[i] = newObj;
                }
            }
        };
        /**
         * Adds an object to an object array. This SHOULD match the objects in the array,
         * or odd things can happen if you use other functions in this file
         *
         * @param objectList The object list to modify, in-place
         * @param newObj The new object to add
         */
        Helper.addLoadedObjToList = function (objectList, newObj) {
            objectList.push(newObj);
        };
        //formats a list of objects that have name/value fields to adds that to a singular object
        //usually used for preparing soem kind of AJAX payload
        //an example of a use case is from jQuery.serializeArray() on a form
        Helper.getListOfFormattedFieldsFromList = function (objectList, fieldToUsAsKey, fieldtoUseAsValue) {
            if (fieldToUsAsKey === void 0) { fieldToUsAsKey = "name"; }
            if (fieldtoUseAsValue === void 0) { fieldtoUseAsValue = "value"; }
            var result = {};
            if (!TypeChecker_1.TypeChecker.isNull(objectList)) {
                objectList.forEach(function (obj) {
                    if (Helper.objectHasProperty(obj, fieldToUsAsKey) && Helper.objectHasProperty(obj, fieldtoUseAsValue)) {
                        result[obj[fieldToUsAsKey]] = obj[fieldtoUseAsValue];
                    }
                });
            }
            return result;
        };
        /**
         * Remove common "stop words" froma  iven string. Useful for searc parameters and other values.
         * For secure searching, this should be done server-side, but this method is a convenient way to do it client-side
         *
         * @param cleansed_string The string with stop words removed
         */
        Helper.removeStopWords = function (cleansed_string) {
            if ((typeof cleansed_string === 'undefined') || (cleansed_string === null) || (cleansed_string === "")) {
                return "";
            }
            var x;
            var y;
            var word;
            var stop_word;
            var regex_str;
            var regex;
            var stop_words = [
                'a', 'about', 'above', 'across', 'after', 'again', 'against', 'all', 'almost', 'alone', 'along', 'already', 'also', 'although', 'always', 'among', 'an', 'and', 'another', 'any', 'anybody', 'anyone', 'anything', 'anywhere', 'are', 'area', 'areas', 'around', 'as', 'ask', 'asked', 'asking', 'asks', 'at', 'away', 'b', 'back', 'backed', 'backing', 'backs', 'be', 'became', 'because', 'become', 'becomes', 'been', 'before', 'began', 'behind', 'being', 'beings', 'best', 'better', 'between', 'big', 'both', 'but', 'by', 'c', 'came', 'can', 'cannot', 'case', 'cases', 'certain', 'certainly', 'clear', 'clearly', 'come', 'could', 'd', 'did', 'differ', 'different', 'differently', 'do', 'does', 'done', 'down', 'down', 'downed', 'downing', 'downs', 'during', 'e', 'each', 'early', 'either', 'end', 'ended', 'ending', 'ends', 'enough', 'even', 'evenly', 'ever', 'every', 'everybody', 'everyone', 'everything', 'everywhere', 'f', 'face', 'faces', 'fact', 'facts', 'far', 'felt', 'few', 'find', 'finds', 'first', 'for', 'four', 'from', 'full', 'fully', 'further', 'furthered', 'furthering', 'furthers', 'g', 'gave', 'general', 'generally', 'get', 'gets', 'give', 'given', 'gives', 'go', 'going', 'good', 'goods', 'got', 'great', 'greater', 'greatest', 'group', 'grouped', 'grouping', 'groups', 'h', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'herself', 'high', 'high', 'high', 'higher', 'highest', 'him', 'himself', 'his', 'how', 'however', 'i', 'if', 'important', 'in', 'interest', 'interested', 'interesting', 'interests', 'into', 'is', 'it', 'its', 'itself', 'j', 'just', 'k', 'keep', 'keeps', 'kind', 'knew', 'know', 'known', 'knows', 'l', 'large', 'largely', 'last', 'later', 'latest', 'least', 'less', 'let', 'lets', 'like', 'likely', 'long', 'longer', 'longest', 'm', 'made', 'make', 'making', 'man', 'many', 'may', 'me', 'member', 'members', 'men', 'might', 'more', 'most', 'mostly', 'mr', 'mrs', 'much', 'must', 'my', 'myself', 'n', 'necessary', 'need', 'needed', 'needing', 'needs', 'never', 'new', 'new', 'newer', 'newest', 'next', 'no', 'nobody', 'non', 'noone', 'not', 'nothing', 'now', 'nowhere', 'number', 'numbers', 'o', 'of', 'off', 'often', 'old', 'older', 'oldest', 'on', 'once', 'one', 'only', 'open', 'opened', 'opening', 'opens', 'or', 'order', 'ordered', 'ordering', 'orders', 'other', 'others', 'our', 'out', 'over', 'p', 'part', 'parted', 'parting', 'parts', 'per', 'perhaps', 'place', 'places', 'point', 'pointed', 'pointing', 'points', 'possible', 'present', 'presented', 'presenting', 'presents', 'problem', 'problems', 'put', 'puts', 'q', 'quite', 'r', 'rather', 'really', 'right', 'right', 'room', 'rooms', 's', 'said', 'same', 'saw', 'say', 'says', 'second', 'seconds', 'see', 'seem', 'seemed', 'seeming', 'seems', 'sees', 'several', 'shall', 'she', 'should', 'show', 'showed', 'showing', 'shows', 'side', 'sides', 'since', 'small', 'smaller', 'smallest', 'so', 'some', 'somebody', 'someone', 'something', 'somewhere', 'state', 'states', 'still', 'still', 'such', 'sure', 't', 'take', 'taken', 'than', 'that', 'the', 'their', 'them', 'then', 'there', 'therefore', 'these', 'they', 'thing', 'things', 'think', 'thinks', 'this', 'those', 'though', 'thought', 'thoughts', 'three', 'through', 'thus', 'to', 'today', 'together', 'too', 'took', 'toward', 'turn', 'turned', 'turning', 'turns', 'two', 'u', 'under', 'until', 'up', 'upon', 'us', 'use', 'used', 'uses', 'v', 'very', 'w', 'want', 'wanted', 'wanting', 'wants', 'was', 'way', 'ways', 'we', 'well', 'wells', 'went', 'were', 'what', 'when', 'where', 'whether', 'which', 'while', 'who', 'whole', 'whose', 'why', 'will', 'with', 'within', 'without', 'work', 'worked', 'working', 'works', 'would', 'x', 'y', 'year', 'years', 'yet', 'you', 'young', 'younger', 'youngest', 'your', 'yours', 'z'
            ];
            // Split out all the individual words in the phrase
            var words = cleansed_string.match(/[^\s]+|\s+[^\s+]$/g);
            // Review all the words
            for (var x_1 = 0; x_1 < words.length; x_1++) {
                // For each word, check all the stop words
                for (var y_1 = 0; y_1 < stop_words.length; y_1++) {
                    // Get the current word
                    word = words[x_1].replace(/\s+|[^a-z]+/ig, ""); // Trim the word and remove non-alpha
                    // Get the stop word
                    stop_word = stop_words[y_1];
                    // If the word matches the stop word, remove it from the keywords
                    if (word.toLowerCase() === stop_word) {
                        // Build the regex
                        regex_str = "^\\s*" + stop_word + "\\s*$"; // Only word
                        regex_str += "|^\\s*" + stop_word + "\\s+"; // First word
                        regex_str += "|\\s+" + stop_word + "\\s*$"; // Last word
                        regex_str += "|\\s+" + stop_word + "\\s+"; // Word somewhere in the middle
                        regex = new RegExp(regex_str, "ig");
                        // Remove the word from the keywords
                        cleansed_string = cleansed_string.replace(regex, " ");
                    }
                }
            }
            return cleansed_string.replace(/^\s+|\s+$/g, "");
        };
        /**
         * Removes duplicates from a given array
         *
         * @param array The array to remove duplicates from
         */
        Helper.uniqueArray = function (array) {
            var result = [];
            jQuery.each(array, function (i, e) {
                if (jQuery.inArray(e, result) === -1) {
                    result.push(e);
                }
            });
            return result;
        };
        /**
         * A relatively fast way to remove duplicates from an array of numbers.
         * Sorts the array, and based on the order, and indices, is able to find the right number to remove
         *
         * @param arr The array to remove duplicates from
         */
        Helper.uniquePrimitives = function (arr) {
            arr.sort();
            for (var i = 1; i < arr.length;) {
                if (arr[i - 1] == arr[i]) {
                    arr.splice(i, 1);
                }
                else {
                    i++;
                }
            }
            return arr;
        };
        /**
         * Removes duplicate objects from an array of objects, given a compare function
         * @param a The array of objects to make unique
         * @param compareFunc The comparison function between 2 object
         */
        Helper.uniqueObjs = function (a, compareFunc) {
            a.sort(compareFunc);
            for (var i = 1; i < a.length;) {
                if (compareFunc(a[i - 1], a[i]) === 0) {
                    a.splice(i, 1);
                }
                else {
                    i++;
                }
            }
            return a;
        };
        /**
         * Removes an element, by instance/value, from an array, in-place
         *
         * @param array The array to modify
         * @param element The object to look for in the array, and remove
         */
        Helper.removeElementFromArray = function (array, element) {
            var index = array.indexOf(element);
            if (index !== -1) {
                array.splice(index, 1);
            }
        };
        /**
         * Removes an element from an array, based on index
         *
         * @param array The array to modify
         * @param idx The index to remove an element from
         */
        Helper.removeIndexFromArray = function (array, idx) {
            if ((idx > -1) && (idx <= array.length)) {
                array.splice(idx, 1); //modifies array in place
            }
        };
        Helper.disableButton = function (button) {
            button.addClass("disabled");
            button.attr("disabled", "disabled");
        };
        Helper.enableButton = function (button) {
            button.removeClass("disabled");
            button.removeAttr("disabled");
        };
        Helper.readOnlyField = function (field) {
            field.addClass("disabled");
            field.attr("disabled", "disabled");
        };
        Helper.editableField = function (field) {
            field.removeClass("disabled");
            field.removeAttr("disabled");
        };
        /**
         * Rotates an element, via CSS, to the given angle "rot"
         *
         * @param $elem The HTML jQuery element to rotate
         * @param rot The degrees to rotate the element by
         */
        Helper.rotateElement = function ($elem, rot) {
            if (typeof rot === 'undefined' || rot === null) {
                rot = 0;
            }
            $elem.css("transform", "rotate(" + rot + "deg)");
        };
        /**
         * A function to toggle the rotation for.
         * The "target" rotation degrees is specified by the data attribute "toggle-rotation" on the element.
         * This and 0 degrees are alternated between.
         *
         * @param $elem The element to toggle rotation for
         */
        Helper.toggleRotation = function ($elem) {
            var dataRotation = $elem.data("toggle-rotation");
            var dataRotated = $elem.data("rotation-toggled");
            if (!dataRotation) {
                return;
            }
            else {
                dataRotated = false;
            }
            if (dataRotated) {
                Helper.rotateElement($elem, 0);
            }
            else {
                Helper.rotateElement($elem, dataRotation);
            }
            $elem.data("rotation-toggled", !dataRotated);
        };
        Helper.elementsAreDescendants = function (parent, childToCheck, allAreDescendants) {
            //if not provided / not boolean, default to false
            if (TypeChecker_1.TypeChecker.isUndefined(allAreDescendants) || !TypeChecker_1.TypeChecker.isBoolean(allAreDescendants)) {
                allAreDescendants = false;
            }
            if (TypeChecker_1.TypeChecker.isEmpty(parent) || TypeChecker_1.TypeChecker.isEmpty(childToCheck)) {
                return false;
            }
            else {
                var result_1 = false;
                var breakLoop_1 = false;
                parent.each(function () {
                    var $parent = jQuery(this);
                    childToCheck.each(function () {
                        var $child = jQuery(this);
                        result_1 = result_1 || jQuery.contains($parent[0], $child[0]);
                        if (allAreDescendants && !result_1) {
                            breakLoop_1 = true;
                        }
                        if (breakLoop_1) {
                            return false;
                        }
                    });
                    if (breakLoop_1) {
                        return false;
                    }
                });
                return result_1;
            }
        };
        //this does NOT get values from radios that are unchecked, so it's best to default a value on a radio button (or use a checkbox)
        Helper.getFormValuesObj = function ($form) {
            var formObj = {};
            var inputs = $form.serializeArray();
            jQuery.each(inputs, function (i, input) {
                formObj[input.name] = input.value;
            });
            return formObj;
        };
        /**
        * Creates / appends FormData obtained from the given form element, and returns the resulting object
        *
        * @param data any kind of data to add to the FormData (array, object, or a primitive)
        * @param formData The existing FormData, or null if none is to be provided
        * @param key The key to add "data" using
        *
        * @return The resulting FormData
        */
        Helper.createFormData = function (data, formData, key) {
            if (formData === void 0) { formData = null; }
            if (key === void 0) { key = ""; }
            if (TypeChecker_1.TypeChecker.isNull(formData)) {
                formData = new FormData();
            }
            if ((typeof data === 'object' && data !== null) || Array.isArray(data)) {
                for (var i in data) {
                    if ((typeof data[i] === 'object' && data[i] !== null) || Array.isArray(data[i])) {
                        Helper.createFormData(formData, data[i], key + '[' + i + ']');
                    }
                    else {
                        formData.append(key + '[' + i + ']', data[i]);
                    }
                }
            }
            else {
                formData.append(key, data);
            }
            return formData;
        };
        Helper.capitalize = function (string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        };
        /**
         * Gets the DATA properties of an object only (not functions)
         *
         * @param obj The object to get data properties of
         */
        Helper.getDataPropertiesOnly = function (obj) {
            var output = {};
            for (var property in obj) {
                if (obj.hasOwnProperty(property) && (typeof obj[property] !== 'function')) {
                    output[property] = obj[property];
                }
            }
            return output;
        };
        Helper.objectHasProperty = function (obj, propertyName) {
            return obj.hasOwnProperty(propertyName);
        };
        Helper.removePropertyFromObject = function (obj, propertyName) {
            var resultObj = jQuery.extend(true, {}, obj); //copy container into new object (deep copy)
            if (TypeChecker_1.TypeChecker.isString(propertyName)) {
                delete resultObj[propertyName];
            }
            return resultObj;
        };
        Helper.hide = function ($target) {
            $target.addClass('hidden');
            $target.hide();
        };
        Helper.show = function ($target, showInlineBlock) {
            if (showInlineBlock === void 0) { showInlineBlock = false; }
            $target.removeClass('hidden');
            if (showInlineBlock) {
                $target.css('display', 'inline-block');
            }
            else {
                $target.show();
            }
        };
        /* Window Unload Helpers */
        //accepts a function with NO params, which returns void
        Helper.AddUnloadFunction = function (func) {
            var idx = Helper.windowUnloadFunctionsToCall.indexOf(func);
            if (idx === -1) {
                Helper.windowUnloadFunctionsToCall.push(func);
            }
            else {
                console.warn("The function to add to window unload is already added.");
            }
        };
        Helper.RemoveUnloadFunction = function (func) {
            var idx = Helper.windowUnloadFunctionsToCall.indexOf(func);
            if (idx !== -1) {
                Helper.windowUnloadFunctionsToCall.splice(idx, 1);
            }
            else {
                console.warn("The function to remove from window unload has not been added.");
            }
        };
        Helper.GetPropertiesOfObjectOnly = function (obj) {
            var output = {};
            for (var property in obj) {
                if (obj.hasOwnProperty(property) && (typeof obj[property] !== 'function')) {
                    output[property] = obj[property];
                }
            }
            return output;
        };
        //A function to call a function parameter if the function is NOT null/undefined
        //Will also accept a parameter for the function, OR a parameter list
        //the function type can accept ANY number of args (even none/undefined) and return a variety of things
        Helper.ExecuteFunctionIfDefined = function (func, args) {
            if ((func !== null) && (typeof func !== 'undefined') && (typeof func === 'function')) {
                if (args) {
                    if ((typeof args === 'object') && (args.constructor === Array)) {
                        //forces the "this" reference of a function to the global instance, as well as expanding the list of arguments
                        //eg: passing in [1,2,3] for args will be the same as: func(1,2,3)
                        func.apply(null, args);
                    }
                    else { //must be single value then
                        func(args);
                    }
                }
                else {
                    func();
                }
            }
        };
        Helper.GetDataIfPresent = function (element, dataName, dataObjectExpected) {
            if (dataObjectExpected === void 0) { dataObjectExpected = null; }
            var data = null;
            if (element.data().hasOwnProperty(dataName)) {
                data = element.data(dataName);
                var compareToType = (typeof dataObjectExpected !== 'undefined') && (dataObjectExpected !== null);
                if ((typeof data === 'undefined') || (data === null) && (!compareToType || (data.constructor !== dataObjectExpected.constructor))) {
                    data = null;
                }
            }
            return data;
        };
        Helper.FunctionDefined = function (fn) {
            return ((fn !== null) && (typeof fn !== 'undefined') && (typeof fn === 'function'));
        };
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
        Helper.uploadFileForm = function (form, url, successCallback, errorCallback, onCompleteCallback, onUploadProgressCallback, filesParamName, extraPayloadFields, progressBar, onRequestProgressCallback, debug) {
            if (successCallback === void 0) { successCallback = AJAX_1.AJAX.standardAjaxSuccess; }
            if (errorCallback === void 0) { errorCallback = AJAX_1.AJAX.standardAjaxError; }
            if (onCompleteCallback === void 0) { onCompleteCallback = null; }
            if (onUploadProgressCallback === void 0) { onUploadProgressCallback = null; }
            if (filesParamName === void 0) { filesParamName = "files"; }
            if (onRequestProgressCallback === void 0) { onRequestProgressCallback = null; }
            if (debug === void 0) { debug = false; }
            if (filesParamName === "") {
                filesParamName = "files";
            }
            var fd = new FormData();
            var hasProgressBar = !TypeChecker_1.TypeChecker.isUndefined(progressBar) && progressBar.hasClass('progress-bar');
            var percentDiv = hasProgressBar ? progressBar.find('.progress-percent') : null;
            var hasPercentDiv = hasProgressBar && (percentDiv.length > 0);
            if (hasProgressBar) {
                progressBar.width("0");
                Helper.show(progressBar.parent());
            }
            // Loop through each data and create an array file[] containing our files data.
            jQuery.each(form.find("input[type=file]"), function (i, input) {
                jQuery.each(input.files, function (j, file) {
                    fd.append(filesParamName + '[' + j + ']', file);
                });
            });
            Helper.ExecuteFunctionIfDefined(extraPayloadFields, fd);
            return jQuery.ajax({
                type: 'POST',
                url: url,
                xhr: function () {
                    var xhr = null; //will be instantiated below
                    if (window.XMLHttpRequest) {
                        xhr = new XMLHttpRequest();
                    }
                    else {
                        xhr = new ActiveXObject("Microsoft.XMLHTTP");
                    }
                    xhr.upload.addEventListener("progress", function (evt) {
                        if (debug) {
                            var datetime = new Date();
                        }
                        if (evt.lengthComputable) {
                            var percentWidth = evt.loaded / evt.total;
                            var finalWidth = Math.floor(percentWidth * 100);
                            if (hasProgressBar) {
                                progressBar.animate({ width: finalWidth + '%' }, {
                                    duration: 100,
                                    step: function (now, fx) {
                                        if (fx.prop == 'width') {
                                            var progressText = Math.round(now * 100) / 100 + '%';
                                            if (hasPercentDiv) {
                                                percentDiv.html(progressText);
                                            }
                                            else {
                                                jQuery(this).html(progressText);
                                            }
                                        }
                                    }
                                });
                            }
                        }
                        Helper.ExecuteFunctionIfDefined(onUploadProgressCallback, evt);
                    }, false);
                    xhr.addEventListener("progress", function (evt) {
                        Helper.ExecuteFunctionIfDefined(onRequestProgressCallback, evt);
                    }, false);
                    return xhr;
                },
                data: fd,
                contentType: false,
                processData: false,
                success: successCallback,
                error: errorCallback,
                complete: function (jqXHR, textStatus) {
                    if (!TypeChecker_1.TypeChecker.isUndefined(progressBar)) {
                        Helper.hide(progressBar.parent());
                    }
                    Helper.ExecuteFunctionIfDefined(onCompleteCallback, [jqXHR, textStatus]);
                }
            });
        };
        Helper.formatFileSize = function (bytes) {
            var bytesInt = parseInt(bytes, 10); //because we are strongly typed here, we can "force" a number through to an int
            var num = numeral(bytes);
            var result = "0B";
            if (bytesInt > 0) {
                result = num.format('0.0b');
            }
            return result;
        };
        Helper.getUrlVars = function (url) {
            if (url === void 0) { url = ''; }
            var vars = {};
            if (!TypeChecker_1.TypeChecker.isUndefined(url) && (url !== '')) {
                var parts = url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
                    vars[key] = value;
                    return m;
                });
            }
            return vars;
        };
        Helper.getUrlParam = function (url, parameter, defaultvalue, useCurrentURL) {
            if (url === void 0) { url = ''; }
            if (parameter === void 0) { parameter = ''; }
            if (defaultvalue === void 0) { defaultvalue = ''; }
            if (useCurrentURL === void 0) { useCurrentURL = false; }
            if (useCurrentURL === true) {
                url = window.location.href;
            }
            var urlparameter = defaultvalue;
            if (url.indexOf(parameter) > -1) {
                urlparameter = Helper.getUrlVars(url)[parameter];
                if (TypeChecker_1.TypeChecker.isUndefined(urlparameter)) {
                    urlparameter = '';
                }
            }
            return urlparameter;
        };
        Helper.getFilenameFromURL = function (url) {
            if (url === void 0) { url = ""; }
            if (!TypeChecker_1.TypeChecker.isNull(url) && url !== "") {
                return url.substring(url.lastIndexOf('/') + 1);
            }
            else {
                return "";
            }
        };
        Helper.contains = function (haystack, needle) {
            var found = false;
            if (!TypeChecker_1.TypeChecker.isNull(haystack) && !TypeChecker_1.TypeChecker.isNull(needle)) {
                found = (haystack.indexOf(needle) !== -1);
            }
            return found;
        };
        Helper.downloadFileAsBlob = function (data, fileName, type) {
            if (type === void 0) { type = "text/plain"; }
            // Create an invisible A element
            var a = document.createElement("a");
            a.style.display = "none";
            document.body.appendChild(a);
            // Set the HREF to a Blob representation of the data to be downloaded
            a.href = window.URL.createObjectURL(new Blob([data], { type: type }));
            // Use download attribute to set set desired file name
            a.setAttribute("download", fileName);
            // Trigger the download by simulating click
            a.click();
            // Cleanup
            window.URL.revokeObjectURL(a.href);
            document.body.removeChild(a);
        };
        Helper.downloadURI = function (uri, name) {
            var link = document.createElement("a");
            link.style.display = "none";
            document.body.appendChild(link);
            link.download = name;
            link.href = uri;
            link.click();
            window.URL.revokeObjectURL(link.href);
            document.body.removeChild(link);
        };
        Helper.basicPrint = function (url) {
            if (TypeChecker_1.TypeChecker.isEmpty(url)) {
                return;
            }
            var w = window.open(url);
            w.print();
            w.close();
        };
        Helper.formatEscapeFilename = function (filename) {
            if (filename === void 0) { filename = ""; }
            return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        };
        Helper.containsMultiple = function (haystack, needles, containsAll) {
            if (containsAll === void 0) { containsAll = false; }
            var found = false;
            if (!TypeChecker_1.TypeChecker.isNull(haystack) && !TypeChecker_1.TypeChecker.isNull(needles)) {
                //use try/catch as a "break" as break isn't allowed in the "forEach" function
                try {
                    needles.forEach(function (needle) {
                        found = (haystack.indexOf(needle) !== -1);
                        if (containsAll && !found) {
                            throw "Break: Break early as needle not found (and all required)";
                        }
                    });
                }
                catch (e) { }
            }
            return found;
        };
        Helper.unique = function (arr) {
            function onlyUnique(value, index, self) {
                return self.indexOf(value) === index;
            }
            return arr.filter(onlyUnique);
        };
        Helper.joinArray = function (arr, delimiter, mappingFunc) {
            if (delimiter === void 0) { delimiter = ","; }
            if (mappingFunc === void 0) { mappingFunc = null; }
            var mapped = arr;
            if (mappingFunc !== null) {
                mapped = arr.map(mappingFunc);
            }
            return mapped.join(delimiter);
        };
        Helper.FindInArray = function (arr, needle) {
            var result = false;
            for (var i = 0; i < arr.length; i++) {
                var element = arr[i];
                if ((TypeChecker_1.TypeChecker.isFunction(needle) && needle(element)) || element == needle) {
                    if (TypeChecker_1.TypeChecker.isArray(result)) {
                        result.push(i);
                    }
                    else if (TypeChecker_1.TypeChecker.isNumber(result)) {
                        result = [result, i];
                    }
                    else {
                        result = i;
                    }
                }
            }
            return result;
        };
        //returns all elements in array1 that are NOT in array2
        /**
         * Returns the difference of 2 arrays (elements in array1, that ar eNOT in array2)
         * @param array1
         * @param array2
         *
         */
        Helper.Diff = function (array1, array2) {
            return array1.filter(function (i) {
                return array2.indexOf(i) < 0;
            });
        };
        /**
         * Ensures every element of an array is fed through parseInt
         *
         * @param arr The array to parse
         */
        Helper.parseIntArray = function (arr) {
            var result = [];
            arr.forEach(function (element) {
                result.push(parseInt(element, 10));
            });
            return result;
        };
        /**
         * Add custom jQuery validate methods
         *
         * @param jquery
         */
        Helper.addCustomValidators = function (jquery) {
            if (!TypeChecker_1.TypeChecker.isUndefined(jquery.fn.validate)) {
                /* Validation Helpers */
                // override jquery validate plugin defaults
                jquery.validator.setDefaults({
                    highlight: function (element) {
                        jQueryModule(element).closest('.form-group').addClass('has-error');
                    },
                    unhighlight: function (element) {
                        jQueryModule(element).closest('.form-group').removeClass('has-error');
                    },
                    errorElement: 'span',
                    errorClass: 'help-block',
                    errorPlacement: function (error, element) {
                        var formGroupParent = jQueryModule(element).parents(".form-group");
                        var errorDestination = formGroupParent.find(".errorPlacement");
                        if (element.parent('.input-group').length) {
                            error.insertAfter(element.parent());
                        }
                        if (errorDestination.length) {
                            errorDestination.first().append(error);
                        }
                        else {
                            error.insertAfter(element);
                        }
                    }
                });
                jquery.validator.addMethod("basicDate", function (value, element) {
                    var validateDate = function (testdate, format) {
                        var date_regex = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/;
                        return date_regex.test(testdate);
                    };
                    return this.optional(element) || validateDate(value, 'MM/DD/YYYY');
                }, "Please enter a valid date.");
                jquery.validator.addMethod("optionSelected", function (value, element) {
                    var isNumber = TypeChecker_1.TypeChecker.stringIsInteger(value);
                    value = isNumber ? parseInt(value) : value;
                    var optional = this.optional(element);
                    var notEmpty = (value > -1) || (!isNumber && (value !== null) && (typeof value !== 'undefined'));
                    return optional || notEmpty;
                }, "Please select an option.");
                jquery.validator.addMethod('greaterThan', function (value, el, param) {
                    var optional = this.optional(el);
                    return optional || (value > param);
                }, "Please enter a value greater than {0}.");
                jquery.validator.addMethod("minlengthIfEntered", function (value, element, param) {
                    var optional = this.optional(element);
                    return optional || ((value.trim().length === 0) || (value.trim().length >= param));
                }, "A value entered must be greater than {0} characters.");
                jquery.validator.addMethod("lengthRangeIfRequired", function (value, element, params) {
                    if ((typeof params.isRequired === 'undefined') || (typeof params.min === 'undefined') || (typeof params.max === 'undefined')) {
                        return false;
                    }
                    else {
                        var isRequiredVal = (typeof params.isRequired === 'function') ? params.isRequired() : params.isRequired;
                        var valid = ((!isRequiredVal) || ((value.length >= params.min) && (value.length <= params.max)));
                        return valid;
                    }
                }, "Please enter input with at least {min} characters, and at max {max} characters.");
                jquery.validator.addMethod("optionSelectedIfRequired", function (value, element, isRequired) {
                    var filteredVal = parseInt(value);
                    filteredVal = (isNaN(filteredVal)) ? -1 : filteredVal;
                    var isRequiredVal = (typeof isRequired === 'function') ? isRequired() : isRequired;
                    return ((!isRequiredVal) || ((filteredVal >= 0)));
                }, "Please select an option.");
                jquery.validator.addMethod("validURL", function (value, element) {
                    var validURL = TypeChecker_1.TypeChecker.isValidURL(value);
                    return this.optional(element) || validURL;
                }, "The entered URL is not valid.");
            }
        };
        Helper.makeElementIDsUnique = function (elements, suffix) {
            if (suffix === void 0) { suffix = ""; }
            if (!TypeChecker_1.TypeChecker.isUndefined(elements) && elements.length > 0) {
                if (suffix === "") {
                    suffix = new Date().getTime().toString(10);
                }
                elements.each(function (idx, el) {
                    var element = jQuery(el);
                    var forProp = element.prop('for');
                    var idProp = element.prop('id');
                    var hasForProp = !TypeChecker_1.TypeChecker.isUndefined(forProp);
                    var hasIdProp = !TypeChecker_1.TypeChecker.isUndefined(idProp);
                    if (hasForProp && forProp) {
                        element.prop('for', forProp + suffix);
                    }
                    if (hasIdProp && idProp) {
                        element.prop('id', idProp + suffix);
                    }
                });
            }
        };
        Helper.makeRecursiveElementIDsUnique = function (elements, suffix) {
            if (suffix === void 0) { suffix = ""; }
            if (!TypeChecker_1.TypeChecker.isUndefined(elements) && elements.length > 0) {
                if (suffix === "") {
                    suffix = new Date().getTime().toString(10);
                }
                elements.each(function (idx, el) {
                    var element = jQuery(el);
                    Helper.makeElementIDsUnique(element, suffix);
                    element.children().each(function () {
                        var childElement = jQuery(this);
                        Helper.makeRecursiveElementIDsUnique(childElement, suffix);
                    });
                });
            }
        };
        Helper.openNewWindow = function (url) {
            var win = window.open(url, '_blank');
            if (win) {
                //Browser has allowed it to be opened
                win.focus();
                return true;
            }
            else {
                //Browser has blocked it
                alert('Opening has been blocked by your popup blocker.');
                return false;
            }
        };
        Helper.scrollToElement = function (selector, time) {
            jQueryModule('html, body').animate({
                scrollTop: jQueryModule(selector).offset().top
            }, time);
        };
        //converts text to its html entity equivalent
        Helper.encodeStringToHTML = function (str) {
            if (str) {
                return jQueryModule("<div />").text(str).html();
            }
            else {
                return "";
            }
        };
        /**
         * Gets the current site "base url" using "location.href"
         */
        Helper.getBaseSiteUrl = function () {
            var pathArray = location.href.split('/');
            var protocol = pathArray[0];
            var host = pathArray[2];
            var url = protocol + '//' + host;
            return url;
        };
        //if url is empty, it uses current url
        Helper.getTwitterShareButtonHTML = function (urlToShare, existingText) {
            if (existingText === void 0) { existingText = ""; }
            if (TypeChecker_1.TypeChecker.isNull(urlToShare) || TypeChecker_1.TypeChecker.isUndefined(urlToShare) || (urlToShare == "")) {
                urlToShare = document.location.href;
            }
            var textEscaped = Helper.encodeStringToHTML(existingText);
            var html = '<div class="tweetLink shareLink">\
                <i class="fa fa-twitter" aria-hidden="true"></i>\
                <a href="https://twitter.com/intent/tweet?text=' + textEscaped + '&url=' + urlToShare + '"\
                onclick="javascript:window.open(this.href, \'\', \'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600\');return false;"\
                target="_blank" title="Tweet This!">Tweet This!</a>\
              </div>';
            return html;
        };
        //if url is empty, it uses current url
        Helper.getEMailShareButtonHTML = function (urlToShare, title, bodyText) {
            if (TypeChecker_1.TypeChecker.isNull(urlToShare) || TypeChecker_1.TypeChecker.isUndefined(urlToShare) || (urlToShare == "")) {
                urlToShare = document.location.href;
            }
            bodyText = Helper.encodeStringToHTML(bodyText);
            title = Helper.encodeStringToHTML(title);
            var html = '<div class="emailLink shareLink">\
                <i class="fa fa-envelope" aria-hidden="true"></i>\
                <a href="mailto:?subject=Hellow%20World%20-%20' + title + '&body=' + bodyText + urlToShare + '">Email This!</a>\
              </div>';
            return html;
        };
        Helper.getFacebookShareButtonHTML = function (urlToShare, title) {
            if (TypeChecker_1.TypeChecker.isNull(urlToShare) || TypeChecker_1.TypeChecker.isUndefined(urlToShare) || (urlToShare == "")) {
                urlToShare = document.location.href;
            }
            var fhtml = '\
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
           <a href="https://www.facebook.com/sharer/sharer.php?u=' + urlToShare + '&t=' + title + '"\
           onclick="javascript:window.open(this.href, \'\', \'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600\');return false;"\
           target="_blank" title="Share on Facebook">\
            <span>Share This!</span>\
           </a>\
        </div>';
            return fhtml;
        };
        Helper.getRedditShareButtonHTML = function (urlToShare) {
            if (TypeChecker_1.TypeChecker.isNull(urlToShare) || TypeChecker_1.TypeChecker.isUndefined(urlToShare) || (urlToShare == "")) {
                urlToShare = document.location.href;
            }
            var rhtml = '\
        <div class="redditShareLink shareLink">\
          <i class="fa fa-reddit" aria-hidden="true"></i>\
          <a href="https://www.reddit.com/submit?url=' + urlToShare + '">\
            Reddit This!\
          </a>\
        </div>';
            return rhtml;
        };
        Helper.stringsSimilar = function (s, s2) {
            var similar = (s.toLowerCase().indexOf(s2) != -1);
            similar = similar || (Helper.getEditDistance(s.toLowerCase(), s2.toLowerCase()) < 3);
            return similar;
        };
        // Compute the edit distance between the two given strings
        Helper.getEditDistance = function (a, b) {
            if (TypeChecker_1.TypeChecker.isUndefined(a) || TypeChecker_1.TypeChecker.isNull(a) || TypeChecker_1.TypeChecker.isUndefined(b) || TypeChecker_1.TypeChecker.isNull(b) || ((a === "") && (b === ""))) {
                return 0;
            }
            if (a.length === 0) {
                return b.length;
            }
            if (b.length === 0) {
                return a.length;
            }
            var matrix = [];
            // increment along the first column of each row
            var i;
            for (i = 0; i <= b.length; i++) {
                matrix[i] = [i];
            }
            // increment each column in the first row
            var j;
            for (j = 0; j <= a.length; j++) {
                matrix[0][j] = j;
            }
            // Fill in the rest of the matrix
            for (i = 1; i <= b.length; i++) {
                for (j = 1; j <= a.length; j++) {
                    if (b.charAt(i - 1) == a.charAt(j - 1)) {
                        matrix[i][j] = matrix[i - 1][j - 1];
                    }
                    else {
                        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                        Math.min(matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1)); // deletion
                    }
                }
            }
            return matrix[b.length][a.length];
        };
        Helper.getUrlParameter = function (sParam) {
            var sPageURL = decodeURIComponent(window.location.search.substring(1));
            var sURLVariables = sPageURL.split('&');
            var sParameterName = [];
            for (var i = 0; i < sURLVariables.length; i++) {
                sParameterName = sURLVariables[i].split('=');
                if (sParameterName[0] === sParam) {
                    return sParameterName[1] === undefined ? "" : sParameterName[1];
                }
            }
            return null;
        };
        Helper.generateUUID = function () {
            var d = new Date().getTime(); //Timestamp
            var d2 = (performance && performance.now && (performance.now() * 1000)) || 0; //Time in microseconds since page-load or 0 if unsupported
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16; //random number between 0 and 16
                if (d > 0) { //Use timestamp until depleted
                    r = (d + r) % 16 | 0;
                    d = Math.floor(d / 16);
                }
                else { //Use microseconds since page-load if supported
                    r = (d2 + r) % 16 | 0;
                    d2 = Math.floor(d2 / 16);
                }
                return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
        };
        //window unload function list
        Helper.windowUnloadFunctionsToCall = [];
        return Helper;
    }());
    exports.Helper = Helper;
});
//# sourceMappingURL=Helper.js.map
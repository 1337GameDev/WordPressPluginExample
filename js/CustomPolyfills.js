//create console group
console.groupCollapsed("Polyfill Messages");

// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: http://es5.github.io/#x15.4.4.19
// Warn if overriding existing method
if (Array.prototype.map) {
    console.log("Overriding existing Array.prototype.map was skipped");
} else {
    Array.prototype.map = function (callback/*, thisArg*/) {

        let T, A, k;

        if (this === null) {
            throw new TypeError('this is null or not defined');
        }

        // 1. Let O be the result of calling ToObject passing the |this| 
        //    value as the argument.
        let O = Object(this);

        // 2. Let lenValue be the result of calling the Get internal 
        //    method of O with the argument "length".
        // 3. Let len be ToUint32(lenValue).
        let len = O.length >>> 0;

        // 4. If IsCallable(callback) is false, throw a TypeError exception.
        // See: http://es5.github.com/#x9.11
        if (typeof callback !== 'function') {
            throw new TypeError(callback + ' is not a function');
        }

        // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 1) {
            T = arguments[1];
        }

        // 6. Let A be a new array created as if by the expression new Array(len) 
        //    where Array is the standard built-in constructor with that name and 
        //    len is the value of len.
        A = new Array(len);

        // 7. Let k be 0
        k = 0;

        // 8. Repeat, while k < len
        while (k < len) {
            let kValue, mappedValue;

            // a. Let Pk be ToString(k).
            //   This is implicit for LHS operands of the in operator
            // b. Let kPresent be the result of calling the HasProperty internal 
            //    method of O with argument Pk.
            //   This step can be combined with c
            // c. If kPresent is true, then
            if (k in O) {
                // i. Let kValue be the result of calling the Get internal 
                //    method of O with argument Pk.
                kValue = O[k];

                // ii. Let mappedValue be the result of calling the Call internal 
                //     method of callback with T as the this value and argument 
                //     list containing kValue, k, and O.
                mappedValue = callback.call(T, kValue, k, O);

                // iii. Call the DefineOwnProperty internal method of A with arguments
                // Pk, Property Descriptor
                // { Value: mappedValue,
                //   Writable: true,
                //   Enumerable: true,
                //   Configurable: true },
                // and false.

                // In browsers that support Object.defineProperty, use the following:
                // Object.defineProperty(A, k, {
                //   value: mappedValue,
                //   writable: true,
                //   enumerable: true,
                //   configurable: true
                // });

                // For best browser support, use the following:
                A[k] = mappedValue;
            }
            // d. Increase k by 1.
            k++;
        }

        // 9. return A
        return A;
    };
}

// Warn if overriding existing method
if (Array.prototype.filter) {
    console.log("Overriding existing Array.prototype.filter skipped");
} else {
    Array.prototype.filter = function (func, thisArg) {
        'use strict';
        if (!(typeof func === "function") && this) {
            throw new TypeError();
        }

        let len = this.length >>> 0,
            res = new Array(len), // preallocate array
            t = this, c = 0, i = -1;
        if (thisArg === undefined) {
            while (++i !== len) {
                // checks to see if the key was set
                if (i in this) {
                    if (func(t[i], i, t)) {
                        res[c++] = t[i];
                    }
                }
            }
        }
        else {
            while (++i !== len) {
                // checks to see if the key was set
                if (i in this) {
                    if (func.call(thisArg, t[i], i, t)) {
                        res[c++] = t[i];
                    }
                }
            }
        }

        res.length = c; // shrink down array to proper size
        return res;
    };
}

// https://tc39.github.io/ecma262/#sec-array.prototype.find
// Warn if overriding existing method
if (Array.prototype.find) {
    console.log("Overriding existing Array.prototype find skipped");
} else {
    Object.defineProperty(Array.prototype, 'find', {
        value: function (predicate) {
            // 1. Let O be ? ToObject(this value).
            if (this === null) {
                throw new TypeError('"this" is null or not defined');
            }

            let o = Object(this);

            // 2. Let len be ? ToLength(? Get(O, "length")).
            let len = o.length >>> 0;

            // 3. If IsCallable(predicate) is false, throw a TypeError exception.
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }

            // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
            let thisArg = arguments[1];

            // 5. Let k be 0.
            let k = 0;

            // 6. Repeat, while k < len
            while (k < len) {
                // a. Let Pk be ! ToString(k).
                // b. Let kValue be ? Get(O, Pk).
                // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
                // d. If testResult is true, return kValue.
                let kValue = o[k];
                if (predicate.call(thisArg, kValue, k, o)) {
                    return kValue;
                }
                // e. Increase k by 1.
                k++;
            }

            // 7. Return undefined.
            return undefined;
        },
        configurable: true,
        writable: true
    });
}

// Warn if overriding existing method
if (Array.prototype.indexOf) {
    console.log("Overriding existing Array.prototype.indexOf skipped");
} else {
    Array.prototype.indexOf = function indexOf(member, startFrom) {
        /*
        In non-strict mode, if the `this` variable is null or undefined, then it is
        set to the window object. Otherwise, `this` is automatically converted to an
        object. In strict mode, if the `this` variable is null or undefined, a
        `TypeError` is thrown.
        */
        if (this === null) {
            throw new TypeError("Array.prototype.indexOf() - can't convert `" + this + "` to object");
        }

        let
          index = isFinite(startFrom) ? Math.floor(startFrom) : 0,
          that = this instanceof Object ? this : new Object(this),
          length = isFinite(that.length) ? Math.floor(that.length) : 0;

        if (index >= length) {
            return -1;
        }

        if (index < 0) {
            index = Math.max(length + index, 0);
        }

        if (member === undefined) {
            /*
              Since `member` is undefined, keys that don't exist will have the same
              value as `member`, and thus do need to be checked.
            */
            do {
                if (index in that && that[index] === undefined) {
                    return index;
                }
            } while (++index < length);
        } else {
            do {
                if (that[index] === member) {
                    return index;
                }
            } while (++index < length);
        }

        return -1;
    };
}

// https://tc39.github.io/ecma262/#sec-array.prototype.findIndex
// Warn if overriding existing method
if (Array.prototype.findIndex) {
    console.log("Overriding existing Array.prototype.findIndex skipped");
} else {
    Object.defineProperty(Array.prototype, 'findIndex', {
        value: function (predicate) {
            // 1. Let O be ? ToObject(this value).
            if (this === null) {
                throw new TypeError('"this" is null or not defined');
            }

            let o = Object(this);

            // 2. Let len be ? ToLength(? Get(O, "length")).
            let len = o.length >>> 0;

            // 3. If IsCallable(predicate) is false, throw a TypeError exception.
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }

            // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
            let thisArg = arguments[1];

            // 5. Let k be 0.
            let k = 0;

            // 6. Repeat, while k < len
            while (k < len) {
                // a. Let Pk be ! ToString(k).
                // b. Let kValue be ? Get(O, Pk).
                // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
                // d. If testResult is true, return k.
                let kValue = o[k];
                if (predicate.call(thisArg, kValue, k, o)) {
                    return k;
                }
                // e. Increase k by 1.
                k++;
            }

            // 7. Return -1.
            return -1;
        },
        configurable: true,
        writable: true
    });
}

// Warn if overriding existing method
if (Array.prototype.equals) {
    console.log("Overriding existing Array.prototype.equals skipped");
} else {
    Array.prototype.equals = function (array) {
        // if the other array is a falsy value, return
        if (!array) {
            return false;
        }

        // compare lengths - can save a lot of time 
        if (this.length !== array.length) {
            return false;
        }

        for (let i = 0, l = this.length; i < l; i++) {
            // Check if we have nested arrays
            if (this[i] instanceof Array && array[i] instanceof Array) {
                // recurse into the nested arrays
                if (!this[i].equals(array[i])) {
                    return false;
                }
            } else if (this[i] !== array[i]) {
                // Warning - two different object instances will never be equal: {x:20} != {x:20}
                return false;
            }
        }
        return true;
    };
    // Hide method from for-in loops
    Object.defineProperty(Array.prototype, "equals", { enumerable: false });
}

// Warn if overriding existing method
if (Array.prototype.intersect) {
    console.log("Overriding existing Array.prototype.intersect skipped.");
} else {
    Array.prototype.intersect = function (array) {
        // if the other array is a falsy value, return
        if (!array) {
            return this;
        }
        //filter first to include elements that exist in both, as well as removing duplicates with the 2nd filter
        let elementsInBoth = this.filter(value => -1 !== array.indexOf(value)).filter(function (element, idx, arr) { // extra step to remove duplicates
            return arr.indexOf(element) === idx;
        });

        return elementsInBoth;
    };
    // Hide method from for-in loops
    Object.defineProperty(Array.prototype, "intersect", { enumerable: false });

}

// Warn if overriding existing method
if (Array.prototype.firstFromFilter) {
    console.log("Overriding existing Array.prototype.firstFromFilter skipped.");
} else {
    Array.prototype.firstFromFilter = function (filter) {
        if (this.length === 0) {
            return null;
        } else {
            let idx = 0;
            let first = this[idx];
            if (typeof filter === 'undefined' || filter === null) {
                return first;
            }

            if (filter(first)) {
                return first;
            } else {
                for (; idx < this.length; idx++) {
                    first = this[idx];
                    if (filter(first)) {
                        return first;
                    }
                }

                return null;
            }
        }
    };
}

// Warn if overriding existing method
if (Array.prototype.lastFromFilter) {
    console.log("Overriding existing Array.prototype.lastFromFilter skipped.");
} else {
    Array.prototype.lastFromFilter = function (filter) {
        if (this.length === 0) {
            return null;
        } else {
            let lastIdx = this.length - 1;
            let last = this[lastIdx];
            if (typeof filter === 'undefined' || filter === null) {
                return last;
            }

            if (filter(last)) {
                return last;
            } else {
                for (; lastIdx > -1; lastIdx--) {
                    last = this[lastIdx];
                    if (filter(last)) {
                        return last;
                    }
                }

                return null;
            }
        }
    };
}

// Warn if overriding existing method
if (Array.prototype.last) {
    console.log("Overriding existing Array.prototype.last skipped.");
} else {
    Array.prototype.last = function () {
        if (this.length === 0) {
            return null;
        } else {
            return this[this.length - 1];
        }
    };
}

// Warn if overriding existing method
if (String.prototype.addSlashes) {
    console.log("Overriding existing String.prototype.addSlashes skipped.");
} else {
    String.prototype.addSlashes = function () {
        //no need to do (str+'') anymore because 'this' can only be a string
        return this.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
    };
}

if (String.prototype.includes) {
    console.log("Overriding existing String.prototype.includes skipped.");
} else {
    String.prototype.includes = function() {
        'use strict';
        return String.prototype.indexOf.apply(this, arguments) !== -1;
    };
}

if (Number.prototype.isNaN) {
    console.log("Overriding existing Number.prototype.isNaN skipped.");
} else {
    Number.prototype.isNaN = function(value) {
        return value !== value;
    };
}

console.groupEnd();
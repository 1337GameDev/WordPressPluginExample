export class TypeChecker {
    public static isString(value:any):boolean {
        return typeof value === 'string' || value instanceof String;
    }
    public static isNumber(value:any):boolean {
        return typeof value === 'number' && isFinite(value);
    };
    public static stringIsInteger(value:any):boolean {
        return TypeChecker.isString(value) && ((""+parseInt(value)).length === value.length);
    };
    public static isInteger(value:any):boolean {
        return TypeChecker.isNumber(value) && (value == parseInt(value));
    };
    public static isArray(value:any):boolean {
        return value && typeof value === 'object' && value.constructor === Array;
    };
    public static isFunction(value:any):boolean {
        return typeof value === 'function';
    };
    public static isObject(value:any):boolean {
        return value && typeof value === 'object' && value.constructor === Object;
    };
    public static isNull(value:any):boolean {
        return value === null;
    };
    public static isBoolean(value:any):boolean {
        return typeof value === 'boolean';
    };
    public static isRegExp(value:any):boolean {
        return value && typeof value === 'object' && value.constructor === RegExp;
    };
    public static isError(value:any):boolean {
        return value instanceof Error && typeof value.message !== 'undefined';
    };
    public static isDate(value:any):boolean {
        return value instanceof Date;
    };
    public static isSymbol(value:any):boolean {
        return typeof value === 'symbol';
    }
    public static isUndefined(value: any):boolean {
        return (value !== null) && (typeof value === 'undefined');
    }
    public static isValidURL(value:string) {
        let isValid = false;
        if((typeof value !== "undefined") && (value !== null)) {
            let res = value.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
            isValid = (res != null);
        }

        return isValid;
    }
    public static isEmpty(value: any):boolean {
        return (TypeChecker.isUndefined(value) || TypeChecker.isNull(value) || (value == false) || (value instanceof jQuery && (<any>value).length === 0));
    }
}
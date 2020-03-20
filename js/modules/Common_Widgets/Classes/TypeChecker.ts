export class TypeChecker {
    public static isString(value:any):boolean {
        return (value !== null) && (typeof value === 'string') || (value instanceof String);
    }
    public static isNumber(value:any):boolean {
        return (value !== null) && (typeof value === 'number') && isFinite(value);
    }
    public static isArray(value:any):boolean {
        return (value !== null) && (typeof value !== 'undefined') && (typeof value === 'object') && (value instanceof Array);
    }
    public static isFunction(value:any):boolean {
        return (value !== null) && (typeof value === 'function');
    }
    public static isObject(value:any):boolean {
        return  (value !== null) && (typeof value !== 'undefined') && (typeof value === 'object') && (value instanceof Object);
    }
    public static isNull(value:any):boolean {
        return (value === null);
    }
    public static isBoolean(value:any):boolean {
        return (value !== null) && (typeof value === 'boolean');
    }
    public static isRegExp(value:any):boolean {
        return (value !== null) && (typeof value !== 'undefined') && (typeof value === 'object') && (value instanceof RegExp);
    }
    public static isError(value:any):boolean {
        return (value !== null) && (value instanceof Error) && (typeof value.message !== 'undefined');
    }
    public static isDate(value:any):boolean {
        return (value !== null) && (value instanceof Date);
    }
    public static isSymbol(value:any):boolean {
        return (value !== null) && (typeof value === 'symbol');
    }
    public static isUndefined(value: any) {
        return (value !== null) && (typeof value === 'undefined');
    }
    public static isBooleanOrFunctionTrue(value:any) {
        return (TypeChecker.isBoolean(value) && value) || (TypeChecker.isFunction(value) && value());
    }
    public static isEmpty(value: any):boolean {
        return (TypeChecker.isUndefined(value) || TypeChecker.isNull(value) || (value == false) || (value instanceof jQuery && (<any>value).length === 0));
    }
}
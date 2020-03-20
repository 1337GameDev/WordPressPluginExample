import {TypeChecker} from './TypeChecker';

export class Helper {
    public static GetDataIfPresent (element, dataName, dataObjectTypeExpected?) {//gets data from an element if valid (and if a value is passed in 'dataObjectExpected' object type is checked), or returns null of invalid
        let data = null;
        let elementData = element.data();

        if (elementData.hasOwnProperty(dataName)) {
            data = element.data(dataName);
            let compareToType = !TypeChecker.isNull(dataObjectTypeExpected) && !TypeChecker.isUndefined(dataObjectTypeExpected);
            let dataEmpty = TypeChecker.isNull(data) || TypeChecker.isUndefined(data);

            if (!dataEmpty && compareToType) {
                if(data.constructor !== dataObjectTypeExpected) {
                    data = null;
                }
            }
        }

        return data;
    }
}

export interface DynamicObject {
    [key: string]: any
}
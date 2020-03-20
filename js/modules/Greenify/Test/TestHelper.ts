import * as convert from 'color-convert';
import * as fs from 'fs';
import * as path from 'path';
import {TypeChecker} from '../Classes/TypeChecker';

export namespace TestHelper {
    export interface DynamicObject {
        [key: string]: any
    }

    export class TestCacheData {
        private static _cachedData: DynamicObject = {};
        public static ClearCache() {
            TestCacheData._cachedData = {};
        }
        public static AddToCache(key:string, data:any, overwriteExistingData:boolean = false) {
            let exists:boolean = TestCacheData._cachedData.hasOwnProperty(key);
            if(!overwriteExistingData && exists) {
                return;
            }
            TestCacheData._cachedData[key] = data;
        }
        public static GetFromCache(key:string):any {
            let exists:boolean = TestCacheData._cachedData.hasOwnProperty(key);
            if(!exists) {
                return null;
            }
            return TestCacheData._cachedData[key];
        }
        public static RemoveFromCache(key:string) {
            let exists:boolean = TestCacheData._cachedData.hasOwnProperty(key);
            if(!exists) {
                return null;
            }
            delete TestCacheData._cachedData[key];
        }
    }

    export class StringHelper {
        public static BeginsWith (str:string, needle:string):boolean {
            if(TypeChecker.isNull(str) || TypeChecker.isUndefined(str) || TypeChecker.isNull(needle) || TypeChecker.isUndefined(needle) || str.length<needle.length) {
                return false;
            }
            return (str.lastIndexOf(needle, 0) === 0);
        }

        public static EndsWith (str:string, needle:string):boolean {
            if(TypeChecker.isNull(str) || TypeChecker.isUndefined(str) || TypeChecker.isNull(needle) || TypeChecker.isUndefined(needle) || str.length<needle.length) {
                return false;
            }

            let idxToStartSearch = str.length - needle.length;
            return (str.lastIndexOf(needle, idxToStartSearch) === idxToStartSearch);
        }
    }

    export class ColorHelper {
         public static ToHexString (val:string):string {
            let returnedVal = "";
            if(!TypeChecker.isNull(val) && !TypeChecker.isUndefined(val) && !TestHelper.StringHelper.BeginsWith(val,"#")) {
                let rgbComponents = TestHelper.ColorHelper.rgbStringToArray(val);
                returnedVal = convert.rgb.hex(rgbComponents);
            }

            return "#"+returnedVal;
        };
        public static rgbStringToArray(rgbStr:string):number[] {
            let rgbComponents:number[] = [];

            if(!TypeChecker.isNull(rgbStr) && !TypeChecker.isUndefined(rgbStr) && TestHelper.StringHelper.BeginsWith(rgbStr.trim(),"rgb")) {
                let rgbStringComponents: string[] = rgbStr.trim().replace(/[^\d,]/g, '').split(',');
                for (let comp of rgbStringComponents) {
                    rgbComponents.push(parseInt(comp));
                }
            }

            return rgbComponents;
        }
    }

    export class HtmlHelper {
        public static LoadTestHTML(filename:string):string {
            if(!TestHelper.StringHelper.EndsWith(filename, ".html") ){
                filename += ".html";
            }

            return fs.readFileSync(path.join(__dirname, "html", filename), "utf8");
        }
    }

}
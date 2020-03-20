import {TypeChecker} from "./TypeChecker";

/**
 * A class to help with detecting the browser version, upon instantiation
 */
export class BrowserDetect {
    private window:Window;
    private versionSearchString:string;

    private browser = "";
    public getBrowser():string{return this.browser;}
    private version:string|number;
    public getVersion():string|number{return this.version;}

    private static dataBrowser = [];

    constructor(window:Window) {
        if(TypeChecker.isEmpty(window)){
            throw 'The window object supplied to BrowserDetect was empty.';
        }

        if(BrowserDetect.dataBrowser.length === 0) {
            BrowserDetect.dataBrowser = [
                {string: window.navigator.userAgent, subString: "Edge", identity: "MS Edge"},
                {string: window.navigator.userAgent, subString: "MSIE", identity: "Explorer"},
                {string: window.navigator.userAgent, subString: "Trident", identity: "Explorer"},
                {string: window.navigator.userAgent, subString: "Firefox", identity: "Firefox"},
                {string: window.navigator.userAgent, subString: "Opera", identity: "Opera"},
                {string: window.navigator.userAgent, subString: "OPR", identity: "Opera"},

                {string: window.navigator.userAgent, subString: "Chrome", identity: "Chrome"},
                {string: window.navigator.userAgent, subString: "Safari", identity: "Safari"}
            ];
        }

        this.init();
    }

    private init() {
        this.browser = this.searchString(BrowserDetect.dataBrowser) || "Other";
        this.version = this.searchVersion(window.navigator.userAgent) || this.searchVersion(window.navigator.appVersion) || "Unknown";
    }

    private searchString(data) {
        for (let i = 0; i < data.length; i++) {
            let dataString = data[i].string;
            this.versionSearchString = data[i].subString;

            if (dataString.indexOf(data[i].subString) !== -1) {
                return data[i].identity;
            }
        }
    }
    private searchVersion(dataString) {
        var index = dataString.indexOf(this.versionSearchString);
        if (index === -1) {
            return;
        }

        var rv = dataString.indexOf("rv:");
        if (this.versionSearchString === "Trident" && rv !== -1) {
            return parseFloat(dataString.substring(rv + 3));
        } else {
            return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
        }
    }
}
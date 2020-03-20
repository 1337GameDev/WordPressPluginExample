/// <reference path="../../../lib/@types/jQuery/index.d.ts" />
/// <reference path="../Test/global.d.ts" />

import { expect } from 'chai';
import 'mocha';
import {Helper} from './Helper';

class testClass1 {
    public f1:string;
    constructor(val:string){this.f1 = val;}
}
class testClass2 {
    public f1:string;
    constructor(val:string){this.f1 = val;}
}

describe('Helper Class', () => {
    let body = null;
    let testTarget1 = null;
    let testTarget2 = null;

    it('GetDataIfPresent2', () => {
        body = jQuery('body');
        testTarget1 = jQuery('.testTarget1');
        testTarget2 = jQuery('.testTarget2');

        let data1 = Helper.GetDataIfPresent(testTarget1,'test');
        let data2 = Helper.GetDataIfPresent(testTarget2,'test');
        expect(data1,"Test data value was incorrect.").to.equal("testdata");
        expect(data2,"Test data value was present, despite not being initialized.").to.equal("");

        let tc1 = new testClass1("testValue");
        testTarget2.data("test", tc1);
        let data3 = Helper.GetDataIfPresent(testTarget2,'test', testClass1);
        let data4 = Helper.GetDataIfPresent(testTarget2,'test');
        let data5 = Helper.GetDataIfPresent(testTarget2,'test', testClass2);
        expect(data3,"Test data value was not present, or wasn't an instance of the \"testClass1\' test class.").to.equal(tc1);
        expect(data4,"Test data returned was not returned.").to.equal(tc1);
        expect(data5,"Null wasn't returned, when the improper class was used as a comparison.").to.equal(null);

    });
});



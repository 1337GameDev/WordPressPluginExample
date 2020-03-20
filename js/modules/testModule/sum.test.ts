import {Math} from './sum';
import { expect } from 'chai';
import 'mocha';

describe('Sum Test', () => {
    it('Sum of 7 and 2, should be 9', () => {
        expect(Math.Calc.sum(7,2)).to.equal(9);
    });


});


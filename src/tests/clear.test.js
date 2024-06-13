import { clear } from "../other.js"
import { data } from "../dataStore.js"


describe('Function clear tests', () => {
    test('Test - return value check', () => {
        console.log("Running clear function test");
        expect(clear()).toEqual({});
    });
});


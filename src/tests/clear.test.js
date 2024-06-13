import { clear } from "../other.js"
import { getData } from "../dataStore.js"


describe('Function clear tests', () => {
    test('Test - return value check', () => {
        expect(clear()).toEqual({});
    });

    test.skip('Test - clear functionality check', () => {
        clear();
        const data = getData();
        expect(data).toEqual({ users: [], });
    })
});


import { clear } from "../other.js"
import { setData, getData } from "../dataStore.js"


describe('Function clear tests', () => {
    test('Test - return value check', () => {
        expect(clear()).toEqual({});
    });

    test('Test - clear functionality check', () => {
        clear();
        const data = getData();
        expect(data).toEqual({ users: [], });
    })
});


import { setData, getData } from "./dataStore.js"
/**
 * Reset the state of the application back to the start.
 * @returns {} - empty object
 */
export function clear () {
    let store = getData();
    store.users = [];
    store.quizzes = [];
    setData(store);
    return {

    };
}
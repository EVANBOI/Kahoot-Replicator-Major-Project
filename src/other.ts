import { setData, getData } from "./dataStore.js"
import { ClearResult } from "./types.js"
/**
 * Reset the state of the application back to the start.
 * @returns {} - empty object
 */
export function clear (): ClearResult {
    let store = getData();
    store.users = [];
    store.quizzes = [];
    setData(store);
    return {};
}
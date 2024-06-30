import { setData, getData } from "./dataStore"
import { ClearResult } from "./types"
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
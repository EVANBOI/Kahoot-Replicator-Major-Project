<<<<<<< HEAD:src/other.ts
import { setData, getData } from "./dataStore"
import { ClearResult } from "./types"
=======
import { setData, getData } from './dataStore.js';
>>>>>>> master:src/other.js
/**
 * Reset the state of the application back to the start.
 * @returns {} - empty object
 */
<<<<<<< HEAD:src/other.ts
export function clear (): ClearResult {
    let store = getData();
    store.users = [];
    store.quizzes = [];
    setData(store);
    return {};
}
=======
export function clear () {
  const store = getData();
  store.users = [];
  store.quizzes = [];
  setData(store);
  return {

  };
}
>>>>>>> master:src/other.js

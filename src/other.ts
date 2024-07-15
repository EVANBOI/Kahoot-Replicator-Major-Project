import { setData, getData } from './dataStore';
import { ClearResult } from './types';
/**
 * Reset the state of the application back to the start.
 * @returns {} - empty object
 */
export function clear (): ClearResult {
  const store = getData();
  store.users = [];
  store.quizzes = [];
  store.trash = [];
  setData(store);
  return {};
}

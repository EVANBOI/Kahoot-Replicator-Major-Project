import {
  setData, getData,
  sessionIdToTimerMap
} from './dataStore';
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

  for (const timer of Array.from(sessionIdToTimerMap.values())) {
    clearTimeout(timer);
  }
  sessionIdToTimerMap.clear();
  setData(store);
  return {};
}

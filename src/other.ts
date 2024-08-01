import { setData, getData, sessionIdToTimerObject } from './dataStore';
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
  if (sessionIdToTimerObject) {
    for (const [sessionId, timer] of Object.entries(sessionIdToTimerObject)) {
      clearTimeout(timer);
      delete sessionIdToTimerObject[Number(sessionId)];
    }
  }
  setData(store);
  return {};
}

import {
  setData, getData,
  sessionIdToTimerMap
} from './dataStore';
import { ClearResult } from './types';
import * as path from 'path';
import * as fs from 'fs';
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

  const dirPath = path.join(__dirname, 'csvresults');
  if (fs.existsSync(dirPath)) {
    fs.rmdirSync(dirPath, { recursive: true });
  }

  setData(store);
  return {};
}

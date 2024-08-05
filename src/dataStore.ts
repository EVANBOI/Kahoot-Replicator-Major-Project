import {
  Data,
  // SessionIdToTimerObject
} from './types';
import fs from 'fs';

import { requestHelper } from './wrappers';
// YOU SHOULD MODIFY THIS OBJECT BELOW ONLY
export const dataStore: Data = {
  users: [],
  quizzes: [],
  trash: []
};

export const sessionIdToTimerMap = new Map<number, ReturnType<typeof setTimeout>>();

// YOU SHOULD MODIFY THIS OBJECT ABOVE ONLY

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

const filePath = 'dataStore.json';

export function getData(): Data {
  try {
    const res = requestHelper('GET', '/data', {});
    return res.jsonBody.data as Data;
  } catch (e) {
    return {
      users: [],
      quizzes: [],
      trash: []
    };
  }
}

// Use set(newData) to pass in the entire data object, with modifications made
export const setData = (newData: Data) => {
  requestHelper('PUT', '/data', { data: newData });
};

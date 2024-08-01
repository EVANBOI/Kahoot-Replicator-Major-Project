import { Data, SessionIdToTimerObject } from './types';
import fs from 'fs';
// YOU SHOULD MODIFY THIS OBJECT BELOW ONLY
export const dataStore: Data = {
  users: [],
  quizzes: [],
  trash: [],
};
export const sessionIdToTimerObject: SessionIdToTimerObject = {};

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
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({}), { flag: 'w' });
  }
  const json = fs.readFileSync(filePath, { flag: 'r' });
  const data = JSON.parse(json.toString());
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
export function setData(newData: Data) {
  const data = JSON.stringify(newData);
  fs.writeFileSync(filePath, data, { flag: 'w' });
}

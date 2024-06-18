// YOU SHOULD MODIFY THIS OBJECT BELOW ONLY
export let data = {
  users: [ {
    authUserId: 1,
    userId: 1,
    email: 'admin@example.com',
    nameFirst: 'Admin',
    nameLast: 'User',
    numSuccessfulLogins: 10,
    numFailedPasswordsSinceLastLogin: 2}
  ],
  quizzes: []
};

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

// Use get() to access the data
export function getData() {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
export function setData(newData) {
  data = newData;
}


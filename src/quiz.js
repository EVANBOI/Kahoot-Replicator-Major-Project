import { getData, setData } from "./dataStore.js"

/**
 * Provide a list of all quizzes that are owned by the currently logged in user.
 * 
 * @param {number} authUserId - unique id of a user
 * @returns {{quizzes: {quizId: number, name: string}}} - an object containing identifiers of all quizzes
 */
export function adminQuizList ( authUserId ) {
    return {quizzes: [
            {
            quizId: 1,
            name: 'My Quiz',
            }
        ]
    }
}

/**
 * Given basic details about a new quiz, create one for the logged in user.
 * 
 * @param {number} authUserId - unique id of a user
 * @param {string} name - name of the quiz
 * @param {string} description - description of a quiz
 * @returns {{quizId: number}}
 */
export function adminQuizCreate (authUserId, name, description) {

    let database = getData();
    const validUser = database.users.find(user => user.userId === authUserId);
    const nameUsed = database.quizzes.find(quizName => quizName.name === name 
                                            && quizName.quizId === authUserId);

    if (!validUser) {
        return { error: 'authUserId is not a valid user' };
    } else if (nameUsed) {
        return {error: 'name has already been used by the user'};
    } else if (!/^[a-zA-Z0-9 ]+$/.test(name)) {
        return { 
            error: 'name contains invalid characters. Valid characters are alphanumeric and spaces' 
        };
    } else if (name.length < 3 || name.length > 30) {
        return { 
            error: 'name is either less than 3 characters long or more than 30 charcters long'
        };
    } else if (description.length > 100) {
        return { error: 'description is more than 100 characters in length'};
    }

    const timestamp1 = Math.floor(Date.now() / 1000);
    const timestamp2 = Math.floor(Date.now() / 1000);
    const id = database.quizzes.length + 1;
    database.quizzes.push({
        quizId: id,
        name: name,
        timeCreated: timestamp1,
        timeLastEdited: timestamp2,
        description: description
    })
    setData(database);

    return {
        quizId: id
    }
}

/**
 * Given a particular quiz, permanently remove the quiz.
 * 
 * @param {number} authUserId - unique id of a user
 * @param {number} quizId - unique id of a quiz
 * @returns {} - empty object
 */
export function adminQuizRemove (authUserId, quizId) {
    return {
        
    }
}

/**
 * Get all of the relevant information about the current quiz.
 * 
 * @param {number} authUserId - unique id of a user
 * @param {number} quizId - unique id of a quiz
 * @returns {{quizId: number, name: string, timeCreated: number, 
 *            timeLastEdited: number, description: string}}
 */
export function adminQuizInfo (authUserId, quizId) {
    return {
        quizId: 1,
        name: 'My Quiz',
        timeCreated: 1683125870,
        timeLastEdited: 1683125871,
        description: 'This is my quiz',
    }
}

/**
 * Update the name of the relevant quiz.
 * @param {number} authUserId - unique id of a user
 * @param {number} quizId - unique id of a quiz
 * @param {string} name- name of a user
 * @returns {} - empty object
 */
export function adminQuizNameUpdate(authUserId, quizId, name){
    return {};
}

/**
 * Update the description of the relevant quiz.
 * 
 * @param {number} authUserId - unique id of a user
 * @param {number} quizId - unique id of a quiz
 * @param {string} description - description of a quiz
 * @returns {} - empty object
 */
export function adminQuizDescriptionUpdate (authUserId, quizId, description) {
    return {

    };
}


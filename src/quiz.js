import { getData, setData} from './dataStore.js';
import { findQuizWithId, findUserWithId } from './helpers.js';


/**
 * Provide a list of all quizzes that are owned by the currently logged in user.
 * 
 * @param {number} authUserId - unique id of a user
 * @returns {{quizzes: {quizId: number, name: string}}} - an object containing identifiers of all quizzes
 */

export function adminQuizList ( authUserId ) {
    const dataBase = getData();
    const userExists = dataBase.users.find(user => user.userId === authUserId);
    if (!userExists) {
        return { error: 'AuthUserId is not a valid user.' }
    }
    const quizzes = dataBase.quizzes.filter(quiz => quiz.creatorId === authUserId);
    const details = quizzes.map(quiz => ({
        quizId: quiz.quizId,
        name: quiz.name
    }))
    return { quizzes: details }
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

    let dataBase = getData();
    const validUser = dataBase.users.find(user => user.userId === authUserId);
    const nameUsed = dataBase.quizzes.find(quizName => quizName.name === name 
                                            && quizName.creatorId === authUserId);

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

    const timeStamp1 = Math.floor(Date.now() / 1000);
    const timeStamp2 = Math.floor(Date.now() / 1000);
    const id = dataBase.quizzes.length + 1;
    dataBase.quizzes.push({
        createrId: validUser.userId,
        quizId: id,
        name: name,
        timeCreated: timeStamp1,
        timeLastEdited: timeStamp2,
        description: description
    })
    setData(dataBase);

    return {
        quizId: id
    };
}

/**
 * Given a particular quiz, permanently remove the quiz.
 * 
 * @param {number} authUserId - unique id of a user
 * @param {number} quizId - unique id of a quiz
 * @returns {} - empty object
 */
export function adminQuizRemove (authUserId, quizId) {
    const store = getData();
    const user = findUserWithId(authUserId);

    if (!user) {
        return { error: 'AuthUserId is not a valid user.' };
    }

    const quiz = findQuizWithId(quizId);

    if (!quiz) {
        return { error: `Quiz with ID '${quizId}' not found` };
    }


    if (quiz.creatorId !== authUserId) {
        return { error: `Quiz with ID ${quizId} is not owned by ${authUserId} (actual owner: ${quiz.userId})` };
    }

    const quizIndex = store.quizzes.findIndex(quiz => quiz.quizId === quizId);
    store.quizzes.splice(quizIndex, 1);
    setData(store);
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

    const user = findUserWithId(authUserId);
    const quiz = findQuizWithId(quizId);
    if (!user) {
        return { error: 'AuthUserId is not a valid user.' };
    }

    if (!quiz) {
        return { error: `Quiz with ID '${quizId}' not found` };
    }

    if (quiz.creatorId !== authUserId) {
        return { error: `Quiz with ID ${quizId} is not owned by ${authUserId} (actual owner: ${quiz.creatorId})` };
    } 


    return {
        quizId: quiz.quizId,
        name: quiz.name,
        timeCreated: quiz.timeCreated,
        timeLastEdited: quiz.timeLastEdited,
        description: quiz.description,
    }
}

/**
 * Update the name of the relevant quiz.
 * @param {number} authUserId - unique id of a user
 * @param {number} quizId - unique id of a quiz
 * @param {string} name- name of a user
 * @returns {} - empty object
 */

export function adminQuizNameUpdate(authUserId, quizId, name) {
    const database = getData();
    const user = database.users.find(user => user.userId === authUserId);
    const quiz = database.quizzes.find(quiz => quiz.quizId === quizId);

    const namePattern = /^[a-zA-Z0-9 ]+$/;
    if (!user) {
        return { error: 'AuthUserId is not a valid user.' };
    }
    if (!quiz) {
        return { error: 'Quiz ID does not refer to a valid quiz.' };
    }
    if (quiz.creatorId !== authUserId) {
        return { error: 'Quiz ID does not refer to a quiz that this user owns.' };
    }
    if (!namePattern.test(name)) {  
        return { error: 'Name contains invalid characters. Valid characters are alphanumeric and spaces.' };
    }
    if (name.length < 3 || name.length > 30) {
        return { error: 'Name is either less than 3 characters long or more than 30 characters long.' };
    }
    const nameUsed = database.quizzes.find(q => q.creatorId === authUserId && q.name === name);
    if (nameUsed) {
        return { error: 'Name is already used by the current logged in user for another quiz.' };
    }

    quiz.name = name;
    setData(database);
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
    let dataBase = getData();
    const validUser = dataBase.users.find(user => user.userId === authUserId);
    const validQuizId = dataBase.quizzes.find(quiz => quiz.quizId === quizId);
    if (!validUser) {
        return { error: 'AuthUserId is not a valid user.' };
    } else if (!validQuizId) {
        return { error: 'Quiz ID does not refer to a valid quiz.' };
    } else if (authUserId !== validQuizId.creatorId) {
        return { error: 'Quiz ID does not refer to a quiz that this user owns.'};
    } else if (description.length > 100) {
        return { error: 'Description is more than 100 characters in length' };
    }

    validQuizId.description = description;
    setData(dataBase);
    return { };
}

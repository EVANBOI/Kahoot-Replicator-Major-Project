/**
 * Provide a list of all quizzes that are owned by the currently logged in user.
 * 
 * @param {number} authUserId - unique id of a user
 * @returns {{quizzes: {quizId: number, name: string}}} - an object containing identifiers of all quizzes
 */
function adminQuizList ( authUserId ) {
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
 * @param {string} name - name of a user
 * @param {string} description - description of a quiz
 * @returns {{quizId: number}}
 */
function adminQuizCreate (authUserId, name, description) {
    return {
        quizId: 2
    }
}

/**
 * Given a particular quiz, permanently remove the quiz.
 * 
 * @param {number} authUserId - unique id of a user
 * @param {number} quizId - unique id of a quiz
 */
function adminQuizRemove (authUserId, quizId) {
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
function adminQuizInfo (authUserId, quizId) {
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
 */
function adminQuizNameUpdate(authUserId, quizId, name){
    return {};
}

/**
 * Update the description of the relevant quiz.
 * 
 * @param {number} authUserId - unique id of a user
 * @param {number} quizId - unique id of a quiz
 * @param {string} description - description of a quiz
 */
function adminQuizDescriptionUpdate (authUserId, quizId, description) {
    return {

    };
}


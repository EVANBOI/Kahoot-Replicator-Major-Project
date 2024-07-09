import { getData, setData } from './dataStore';
import { findQuizWithId, findUserBySessionId } from './helpers';
import { EmptyObject, ErrorMessage, Quiz, QuizIdObject, QuizInfoResult, QuizListDetails, QuizRemoveResult } from './types';
/**
 * Provide a list of all quizzes that are owned by the currently logged in user.
 *
 * @param {string} sessionId - unique id of a session
 * @returns {{quizzes: {quizId: number, name: string}}} - an object containing identifiers of all quizzes
 * @returns {{error: string}} an error
 */
export function adminQuizList (sessionId: string): QuizListDetails {
  const database = getData();
  const user = findUserBySessionId(database, sessionId);
  if (!user) {
    return { error: 'Session id is not valid.' };
  }
  const creatorId = user.userId;
  const quizzes = database.quizzes.filter(quiz => quiz.creatorId === creatorId);
  const details = quizzes.map(quiz => ({
    quizId: quiz.quizId,
    name: quiz.name
  }));
  return { quizzes: details };
}

/**
 * Given basic details about a new quiz, create one for the logged in user.
 *
 * @param {string} sessionId - unique id of a user
 * @param {string} name - name of the quiz
 * @param {string} description - description of a quiz
 * @returns {{quizId: number}}
 * @returns {{error: string}} an error
 */
export function adminQuizCreate (
  sessionId: string,
  name: string,
  description: string): ErrorMessage | QuizIdObject {
  const database = getData();
  console.log(sessionId);
  console.log(name);
  console.log(description);
  const user = findUserBySessionId(database, sessionId);
  const nameUsed = database.quizzes.find(
    quiz => quiz.name === name &&
    quiz.creatorId === user?.userId);

  if (!user) {
    return { error: 'Session ID is not valid' };
  } else if (nameUsed) {
    return { error: 'name has already been used by the user' };
  } else if (!/^[a-zA-Z0-9 ]+$/.test(name)) {
    return {
      error: 'name contains invalid characters. Valid characters are alphanumeric and spaces'
    };
  } else if (name.length < 3 || name.length > 30) {
    return {
      error: 'name is either less than 3 characters long or more than 30 charcters long'
    };
  } else if (description.length > 100) {
    return { error: 'description is more than 100 characters in length' };
  }

  const timeStamp1 = Math.floor(Date.now() / 1000);
  const timeStamp2 = Math.floor(Date.now() / 1000);
  const id = database.quizzes.length + 1;
  database.quizzes.push({
    creatorId: user.userId,
    quizId: id,
    name: name,
    timeCreated: timeStamp1,
    timeLastEdited: timeStamp2,
    description: description
  });
  setData(database);

  return { quizId: id };
}

/**
 * Given a particular quiz, permanently remove the quiz.
 *
 * @param {number} sessionId - unique id of a user
 * @param {number} quizId - unique id of a quiz
 * @returns {} - empty object
 * @returns {{error: string}} an error
 */
export function adminQuizRemove (sessionId: string, quizId: number): QuizRemoveResult {
  const store = getData();
  const user = findUserBySessionId(store, sessionId);

  if (!user) {
    return { error: 'AuthUserId is not a valid user.' };
  }
  const quiz = findQuizWithId(quizId);
  if (!quiz) {
    return { error: `Quiz with ID '${quizId}' not found` };
  }
  if (quiz.creatorId !== user.userId) {
    return { error: `Quiz with ID ${quizId} is not owned by ${user.userId} (actual owner: ${quiz.creatorId})` };
  }

  const quizIndex = store.quizzes.findIndex(quiz => quiz.quizId === quizId);
  store.quizzes.splice(quizIndex, 1);
  setData(store);
  return {

  };
}

/**
 * Get all of the relevant information about the current quiz.
 *
 * @param {number} sessionId - unique id of a user
 * @param {number} quizId - unique id of a quiz
 * @returns {{quizId: number, name: string, timeCreated: number,
 *            timeLastEdited: number, description: string}}
 * @returns {{error: string}} an error
 */
export function adminQuizInfo (sessionId: string, quizId: number): QuizInfoResult {
  const database = getData();
  const user = findUserBySessionId(database, sessionId);
  const quiz = findQuizWithId(quizId);
  if (!user) {
    return { error: 'sessionId is not a valid.' };
  }

  if (!quiz) {
    return { error: `Quiz with ID '${quizId}' not found` };
  }

  if (quiz.creatorId !== user.userId) {
    return { error: `Quiz with ID ${quizId} is not owned by ${user.userId} (actual owner: ${quiz.creatorId})` };
  }

  return {
    quizId: quiz.quizId,
    name: quiz.name,
    timeCreated: quiz.timeCreated,
    timeLastEdited: quiz.timeLastEdited,
    description: quiz.description,
  };
}

/**
 * Update the name of the relevant quiz.
 * @param {number} sessionId - unique session id of a user
 * @param {number} quizId - unique id of a quiz
 * @param {string} name- name of a user
 * @returns {} - empty object
 * @returns {{error: string}} an error
 */
export function adminQuizNameUpdate(sessionId: string, quizId: number, name: string): EmptyObject | ErrorMessage {
  const database = getData();
  const user = findUserBySessionId(database, sessionId);
  if (!user) {
    return { error: 'sessionId is not valid.' };
  }
  const authUserId = user.userId;
  const quiz: Quiz | undefined = database.quizzes.find(quiz => quiz.quizId === quizId);

  const namePattern = /^[a-zA-Z0-9 ]+$/;
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
 * @returns {{error: string}} an error
 */
export function adminQuizDescriptionUpdate (
  sessionId: string,
  quizId: number,
  description: string): EmptyObject | ErrorMessage {
  const database = getData();
  const user = findUserBySessionId(database, sessionId);
  const validQuizId = database.quizzes.find(quiz => quiz.quizId === quizId);
  if (!user) {
    return { error: 'AuthUserId is not a valid user.' };
  } else if (!validQuizId) {
    return { error: 'Quiz ID does not refer to a valid quiz.' };
  } else if (user.userId !== validQuizId.creatorId) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns.' };
  } else if (description.length > 100) {
    return { error: 'Description is more than 100 characters in length' };
  }

  validQuizId.description = description;
  validQuizId.timeLastEdited = Math.floor(Date.now() / 1000);
  setData(database);
  return {};
}

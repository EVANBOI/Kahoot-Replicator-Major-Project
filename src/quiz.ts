import { getData, setData } from './dataStore';
import { Unauthorised, BadRequest, Forbidden } from './error';

import {
  findQuizWithId,
  findUserBySessionId,
} from './helpers';
import { SessionStatus } from './session';
import {
  EmptyObject,
  ErrorMessage,
  QuizIdObject,
  QuizInfoResult,
  TrashViewDetails,
  QuizRestoreResult,
  QuizListDetails,
  QuizRemoveResult,
  QuizTrashEmptyResult,
} from './types';

import ShortUniqueId from 'short-unique-id';
const quizUid = new ShortUniqueId({ dictionary: 'number' });
/**
 * Provide a list of all quizzes that are owned by the currently logged in user.
 *
 * @param {string} token - unique id of a session
 * @returns {{quizzes: {quizId: number, name: string}}} - an object containing identifiers of all quizzes
 * @returns {ErrorMessage} an error
 */
export function adminQuizList (token: string): QuizListDetails {
  const database = getData();
  const user = findUserBySessionId(database, token);
  if (!user) {
    throw new Unauthorised('Session id is not valid.');
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
 * @returns {ErrorMessage} an error
 */
export function adminQuizCreate (
  sessionId: string,
  name: string,
  description: string): ErrorMessage | QuizIdObject {
  const database = getData();
  const user = findUserBySessionId(database, sessionId);
  const nameUsed = database.quizzes.find(
    quiz => quiz.name === name &&
    quiz.creatorId === user?.userId);

  if (nameUsed) {
    throw new BadRequest('name has already been used by the user');
  } else if (!/^[a-zA-Z0-9 ]+$/.test(name)) {
    throw new BadRequest('name contains invalid characters. Valid characters are alphanumeric and spaces');
  } else if (name.length < 3 || name.length > 30) {
    throw new BadRequest('name is either less than 3 characters long or more than 30 charcters long');
  } else if (description.length > 100) {
    throw new BadRequest('description is more than 100 characters in length');
  }

  const timeStamp1 = Math.floor(Date.now() / 1000);
  const timeStamp2 = Math.floor(Date.now() / 1000);
  const id = parseInt(quizUid.seq());
  database.quizzes.push({
    creatorId: user.userId,
    quizId: id,
    name: name,
    timeCreated: timeStamp1,
    timeLastEdited: timeStamp2,
    description: description,
    numQuestions: 0,
    questions: [],
    duration: 0
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
 * @returns {ErrorMessage} an error
 */
export function adminQuizRemove (token: string, quizId: number): QuizRemoveResult {
  const database = getData();
  const user = findUserBySessionId(database, token);

  if (!user) {
    throw new Unauthorised('AuthUserId is not a valid user.');
  }
  const quiz = findQuizWithId(database, quizId);
  if (!quiz) {
    throw new Forbidden(`Quiz with ID '${quizId}' not found`);
  } else if (quiz.creatorId !== user.userId) {
    throw new Forbidden(`Quiz with ID ${quizId} is not owned by ${user.userId} (actual owner: ${quiz.creatorId})`);
  }

  const quizIndex = database.quizzes.findIndex(quiz => quiz.quizId === quizId);
  database.trash.push(quiz);
  database.quizzes.splice(quizIndex, 1);

  setData(database);
  return {};
}

/**
 * Get all of the relevant information about the current quiz.
 *
 * @param {string} token - unique session id of a user
 * @param {number} quizId - unique id of a quiz
 * @returns {QuizInfoResult} - an object containing all the information about the quiz
 */
export function adminQuizInfo (token: string, quizId: number, v2?: boolean): QuizInfoResult {
  const database = getData();
  const user = findUserBySessionId(database, token);
  const quiz = findQuizWithId(database, quizId);

  if (!quiz) {
    throw new Forbidden(`Quiz with ID '${quizId}' not found`);
  } else if (quiz.creatorId !== user.userId) {
    throw new Forbidden(`Quiz with ID ${quizId} is not owned by ${user.userId} (actual owner: ${quiz.creatorId})`);
  }

  if (v2 === true) {
    return {
      quizId: quiz.quizId,
      name: quiz.name,
      timeCreated: quiz.timeCreated,
      timeLastEdited: quiz.timeLastEdited,
      description: quiz.description,
      numQuestions: quiz.questions.length,
      questions: quiz.questions,
      duration: quiz.duration,
      thumbnailUrl: quiz.thumbnailUrl
    };
  } else {
    return {
      quizId: quiz.quizId,
      name: quiz.name,
      timeCreated: quiz.timeCreated,
      timeLastEdited: quiz.timeLastEdited,
      description: quiz.description,
      numQuestions: quiz.questions.length,
      questions: quiz.questions,
      duration: quiz.duration,
    };
  }
}

/**
 * Update the name of the relevant quiz.
 * @param {number} sessionId - unique session id of a user
 * @param {number} quizId - unique id of a quiz
 * @param {string} name- name of a user
 * @returns {} - empty object
 * @returns {ErrorMessage} an error
 */
export function adminQuizNameUpdate(sessionId: string, quizId: number, name: string): EmptyObject | ErrorMessage {
  const database = getData();
  const user = findUserBySessionId(database, sessionId);
  if (!user) {
    throw new Unauthorised('sessionId is not valid.');
  }
  const authUserId = user.userId;
  const quiz = findQuizWithId(database, quizId);

  const namePattern = /^[a-zA-Z0-9 ]+$/;
  if (!quiz) {
    throw new Forbidden('Quiz ID does not refer to a valid quiz.')
  }
  if (quiz.creatorId !== authUserId) {
    throw new Forbidden('Quiz ID does not refer to a quiz that this user owns.')
  }
  if (!namePattern.test(name)) {
    throw new BadRequest('Name contains invalid characters. Valid characters are alphanumeric and spaces.');
  }
  if (name.length < 3 || name.length > 30) {
    throw new BadRequest('Name is either less than 3 characters long or more than 30 characters long.');
  }
  const nameUsed = database.quizzes.find(q => q.creatorId === authUserId && q.name === name);
  if (nameUsed) {
    throw new BadRequest('Name is already used by the current logged in user for another quiz.');
  }

  quiz.name = name;
  setData(database);
  return {};
}

/**
 * Update the description of the relevant quiz.
 *
 * @param {number} quizId - unique id of a quiz
 * @param {string} description - description of a quiz
 * @returns {} - empty object
 * @returns {ErrorMessage} an error
 */
export function adminQuizDescriptionUpdate(
  token: string,
  quizId: number,
  description: string): EmptyObject | ErrorMessage {
  const database = getData();
  const user = findUserBySessionId(database, token);
  const validQuizId = database.quizzes.find(quiz => quiz.quizId === quizId);
  if (!user) {
    throw new Unauthorised('AuthUserId is not a valid user.');
  } else if (!validQuizId) {
    throw new Forbidden('Quiz ID does not refer to a valid quiz.');
  } else if (user.userId !== validQuizId.creatorId) {
    throw new Forbidden('Quiz ID does not refer to a quiz that this user owns.');
  } else if (description.length > 100) {
    throw new BadRequest('Description is more than 100 characters in length');
  }
  validQuizId.description = description;
  validQuizId.timeLastEdited = Math.floor(Date.now() / 1000);
  setData(database);
  return {};
}

/**
 * Given a token/sessionId, view the quizzes that are currently in the trash for
 * logged in user.
 *
 * @param {string} sessionId - unique id of a user
 * @returns {{quizzes: {quizId: number, name: string}}} - an object containing identifiers of all quizzes
 * @returns {ErrorMessage} an error
 */
export function adminQuizTrashView(sessionId: string): TrashViewDetails {
  const database = getData();
  const user = findUserBySessionId(database, sessionId);
  if (!user) {
    throw new Unauthorised('Token does not exist or is invalid.');
  }
  const creatorId = user.userId;
  const trashView = database.trash.filter(quiz => quiz.creatorId === creatorId);
  const details = trashView.map(quiz => ({
    quizId: quiz.quizId,
    name: quiz.name
  }));
  return { quizzes: details };
}

/**
 * clear the quiz trash
 *
 * @param {string} quizIds - the stringified array of quiz Ids.
 * @returns {} - empty object
 */
export function adminQuizTrashEmpty(quizIds: string): QuizTrashEmptyResult {
  const database = getData();
  const quizArray = JSON.parse(quizIds);
  database.trash = database.trash.filter(quiz => !quizArray.includes(quiz.quizId));
  setData(database);

  return {};
}

/**
 * Transfer quiz ownership to a new owner.
 *
 * @param {string} sessionId - The session ID of the current user.
 * @param {number} quizId - The ID of the quiz to transfer.
 * @param {string} newOwnerEmail - The email of the new owner.
 * @returns {ErrorMessage | EmptyObject} - The result of the transfer operation.
 */
export function adminQuizTransfer(sessionId: string, quizId: number, newOwnerEmail: string, v2?: boolean): EmptyObject {
  const database = getData();
  const currentUser = findUserBySessionId(database, sessionId);

  if (!currentUser) {
    throw new Unauthorised('Session ID is not valid');
  }
  const quiz = findQuizWithId(database, quizId);

  if (!quiz) {
    throw new Forbidden(`Quiz with ID '${quizId}' not found`);
  } else if (quiz.creatorId !== currentUser.userId) {
    throw new Forbidden(`User does not own quiz ${quizId}`);
  }
  const newOwner = database.users.find(user => user.email === newOwnerEmail);

  if (!newOwner) {
    throw new BadRequest('User email is not a real user.');
  }
  if (newOwner.userId === currentUser.userId) {
    throw new BadRequest('User email is the current logged in user.');
  }

  const nameUsed = database.quizzes.some(
    q => q.name === quiz.name && q.creatorId === newOwner.userId && q.quizId !== quizId
  );
  if (nameUsed) {
    throw new BadRequest('Quiz ID refers to a quiz that has a name that is already used by the target user.');
  }

  if (v2 === true) {
    if (quiz.sessions.find(s => s.state === SessionStatus.END)) {
      throw new BadRequest('At least one session has not ended');
    }
  }

  quiz.creatorId = newOwner.userId;
  setData(database);
  return {};
}

/**
 * Restores a quiz from the trash.
 * @param {string} token The session token of the user.
 * @param {number} quizId The ID of the quiz to be restored.
 * @returns {} An empty object
 * @returns {ErrorMessage} An error message
 */
export function adminQuizRestore(token: string, quizId: number): QuizRestoreResult {
  const database = getData();
  const user = findUserBySessionId(database, token);

  if (!user) {
    throw new Unauthorised('Token is empty or invalid.');
  }
  const quizIndex = database.trash.findIndex(quiz => quiz.quizId === quizId);
  const quizExists = database.quizzes.find(q => q.quizId === quizId);
  const quizTrash = database.trash[quizIndex];
  if (!quizExists && quizIndex === -1) {
    throw new Forbidden(`Quiz '${quizId}' does not exist!.`);
  } else if (quizTrash && quizTrash.creatorId !== user.userId) {
    throw new Forbidden(`User is not the owner of quiz with ID '${quizId}'.`);
  }

  // Check if quiz name is already used by another active quiz
  if (quizExists) {
    throw new BadRequest(`Quiz ${quizExists.quizId} is not in trash`);
  } else if (database.quizzes.some(activeQuiz => activeQuiz.name === quizTrash.name)) {
    throw new BadRequest(`Quiz name '${quizTrash.name}' is already used by another active quiz.`);
  }

  // Restore the quiz
  quizTrash.timeLastEdited = Date.now();
  database.quizzes.push(quizTrash);
  database.trash.splice(quizIndex, 1);

  setData(database);
  return {};
}

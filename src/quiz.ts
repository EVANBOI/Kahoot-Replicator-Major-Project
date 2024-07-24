import { getData, setData } from './dataStore';

import {
  findQuizWithId, findUserBySessionId, isQuizExistWithCorrectCreator,
  isAllExistInTrash, findQuestionInQuizId, findQuestionIndex,
  validQuestion,
  getRandomColour
} from './helpers';
import {
  CreateQuestionReturn,
  EmptyObject,
  ErrorMessage,
  QuestionBody,
  Quiz,
  QuizIdObject,
  QuizInfoResult,
  TrashViewDetails,
  QuizRestoreResult,
  QuizQuestionDeleteResult,
  UserUpdateResult,
  QuizListDetails,
  QuizRemoveResult,
  QuizTrashEmptyResult,
  PositionWithTokenObj,
  QuizQuestionMoveResult
} from './types';

import ShortUniqueId from 'short-unique-id';
const answerUid = new ShortUniqueId({ dictionary: 'number' });
const questionUid = new ShortUniqueId({ dictionary: 'number' });
const quizUid = new ShortUniqueId({ dictionary: 'number' });
/**
 * Provide a list of all quizzes that are owned by the currently logged in user.
 *
 * @param {string} sessionId - unique id of a session
 * @returns {{quizzes: {quizId: number, name: string}}} - an object containing identifiers of all quizzes
 * @returns {ErrorMessage} an error
 */
export function adminQuizList (sessionId: string): QuizListDetails {
  const database = getData();
  const user = findUserBySessionId(database, sessionId);
  if (!user) {
    return { statusCode: 401, error: 'Session id is not valid.' };
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

  if (!user) {
    return { statusCode: 401, error: 'Session ID is not valid' };
  } else if (nameUsed) {
    return { statusCode: 400, error: 'name has already been used by the user' };
  } else if (!/^[a-zA-Z0-9 ]+$/.test(name)) {
    return {
      statusCode: 400,
      error: 'name contains invalid characters. Valid characters are alphanumeric and spaces'
    };
  } else if (name.length < 3 || name.length > 30) {
    return {
      statusCode: 400,
      error: 'name is either less than 3 characters long or more than 30 charcters long'
    };
  } else if (description.length > 100) {
    return { statusCode: 400, error: 'description is more than 100 characters in length' };
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
    return { statusCode: 401, message: 'AuthUserId is not a valid user.' };
  }
  const quiz = findQuizWithId(database, quizId);
  if (!quiz) {
    return { statusCode: 403, message: `Quiz with ID '${quizId}' not found` };
  }
  if (quiz.creatorId !== user.userId) {
    return { statusCode: 403, message: `Quiz with ID ${quizId} is not owned by ${user.userId} (actual owner: ${quiz.creatorId})` };
  }

  const quizIndex = database.quizzes.findIndex(quiz => quiz.quizId === quizId);
  database.trash.push(quiz);
  database.quizzes.splice(quizIndex, 1);

  setData(database);
  return {
    statusCode: 200,
    message: '{}'
  };
}

/**
 * Get all of the relevant information about the current quiz.
 *
 * @param {string} sessionId - unique session id of a user
 * @param {number} quizId - unique id of a quiz
 * @returns {{quizId: number, name: string, timeCreated: number,
 *            timeLastEdited: number, description: string,
 *            questions: QuestionBody[], duration: number}}
 * @returns {ErrorMessage} an error
 */
export function adminQuizInfo (sessionId: string, quizId: number): QuizInfoResult {
  const database = getData();
  const user = findUserBySessionId(database, sessionId);
  const quiz = findQuizWithId(database, quizId);
  if (!user) {
    return { statusCode: 401, error: 'sessionId is not a valid.' };
  }

  if (!quiz) {
    return { statusCode: 403, error: `Quiz with ID '${quizId}' not found` };
  } else if (quiz.creatorId !== user.userId) {
    return {
      statusCode: 403,
      error: `Quiz with ID ${quizId} is not owned by ${user.userId} (actual owner: ${quiz.creatorId})`
    };
  }

  return {
    quizId: quiz.quizId,
    name: quiz.name,
    timeCreated: quiz.timeCreated,
    timeLastEdited: quiz.timeLastEdited,
    description: quiz.description,
    questions: quiz.questions,
    duration: quiz.duration
  };
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
    return { statusCode: 401, error: 'sessionId is not valid.' };
  }
  const authUserId = user.userId;
  const quiz: Quiz | undefined = database.quizzes.find(quiz => quiz.quizId === quizId);

  const namePattern = /^[a-zA-Z0-9 ]+$/;
  if (!quiz) {
    return { statusCode: 403, error: 'Quiz ID does not refer to a valid quiz.' };
  }
  if (quiz.creatorId !== authUserId) {
    return { statusCode: 403, error: 'Quiz ID does not refer to a quiz that this user owns.' };
  }
  if (!namePattern.test(name)) {
    return { statusCode: 400, error: 'Name contains invalid characters. Valid characters are alphanumeric and spaces.' };
  }
  if (name.length < 3 || name.length > 30) {
    return { statusCode: 400, error: 'Name is either less than 3 characters long or more than 30 characters long.' };
  }
  const nameUsed = database.quizzes.find(q => q.creatorId === authUserId && q.name === name);
  if (nameUsed) {
    return { statusCode: 400, error: 'Name is already used by the current logged in user for another quiz.' };
  }

  quiz.name = name;
  setData(database);
  return {};
}

/**
 * Update the description of the relevant quiz.
 *
 * @param {number} sessionId - unique id of a user
 * @param {number} quizId - unique id of a quiz
 * @param {string} description - description of a quiz
 * @returns {} - empty object
 * @returns {ErrorMessage} an error
 */
export function adminQuizDescriptionUpdate(
  sessionId: string,
  quizId: number,
  description: string): EmptyObject | ErrorMessage {
  const database = getData();
  const user = findUserBySessionId(database, sessionId);
  const validQuizId = database.quizzes.find(quiz => quiz.quizId === quizId);
  if (!user) {
    return { statusCode: 401, error: 'AuthUserId is not a valid user.' };
  } else if (!validQuizId) {
    return { statusCode: 403, error: 'Quiz ID does not refer to a valid quiz.' };
  } else if (user.userId !== validQuizId.creatorId) {
    return { statusCode: 403, error: 'Quiz ID does not refer to a quiz that this user owns.' };
  } else if (description.length > 100) {
    return { statusCode: 400, error: 'Description is more than 100 characters in length' };
  }

  validQuizId.description = description;
  validQuizId.timeLastEdited = Math.floor(Date.now() / 1000);
  setData(database);
  return {};
}

/**
 * Create questions for quizzes given the contents of the question and
 * generate unique ids for the questions as well as the answers inside it.
 * Each answer is assigned a random colour code.
 *
 * @param {number} quizId - unique id of a quiz
 * @param {string} sessionId - unique session id of a quiz
 * @param {QuestionBody} questionBody - contains information of a question
 * @returns {{questionId: number}} - id of a question that is unique only inside a quiz
 * @returns {ErrorMessage} an error
 */
export function adminCreateQuizQuestion(
  quizId: number,
  sessionId: string,
  questionBody: QuestionBody): CreateQuestionReturn {
  const database = getData();
  const user = findUserBySessionId(database, sessionId);
  if (!user) {
    return { statusCode: 401, error: 'Session ID is invalid' };
  }
  const quiz = findQuizWithId(database, quizId);
  if (!quiz) {
    return { statusCode: 403, error: 'Quiz does not exist' };
  } else if (quiz.creatorId !== user.userId) {
    return { statusCode: 403, error: 'User is not an owner of quiz' };
  }
  const totalDuration = quiz.duration + questionBody.duration;
  if (typeof validQuestion(questionBody, totalDuration) === 'object') {
    return validQuestion(questionBody, totalDuration) as ErrorMessage;
  }
  const questionId = parseInt(questionUid.seq());
  questionBody.questionId = questionId;
  for (const ans of questionBody.answers) {
    ans.answerId = parseInt(answerUid.seq());
    ans.colour = getRandomColour();
  }
  quiz.questions.push(questionBody);
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  quiz.duration += questionBody.duration;
  setData(database);
  return { questionId: questionId };
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
    return {
      statusCode: 401,
      error: 'Token does not exist or is invalid'
    };
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
 * @param {string} token - unique sessionId
 * @param {string} quizIds - the stringified array of quiz Ids.
 * @returns {} - empty object
 * @returns {ErrorMessage} an error
 */
export function adminQuizTrashEmpty(token: string, quizIds: string): QuizTrashEmptyResult {
  const database = getData();
  const user = findUserBySessionId(database, token);
  if (!user) {
    return { statusCode: 401, error: 'Token is empty or invalid.' };
  }
  if (!isQuizExistWithCorrectCreator(token, quizIds)) {
    return { statusCode: 403, error: 'Quiz does not exist or given wrong creator.' };
  }
  if (!isAllExistInTrash(quizIds)) {
    return { statusCode: 400, error: 'One or more of the Quiz IDs is not currently in the trash.' };
  }

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
export function adminQuizTransfer(sessionId: string, quizId: number, newOwnerEmail: string): ErrorMessage | EmptyObject {
  const database = getData();
  const currentUser = findUserBySessionId(database, sessionId);

  if (!currentUser) {
    return { statusCode: 401, error: 'Session ID is not valid' };
  }
  const quiz = findQuizWithId(database, quizId);

  if (!quiz) {
    return { statusCode: 403, error: `Quiz with ID '${quizId}' not found` };
  }

  const newOwner = database.users.find(user => user.email === newOwnerEmail);

  if (!newOwner) {
    return { statusCode: 400, error: 'User email is not a real user.' };
  }
  if (newOwner.userId === currentUser.userId) {
    return { statusCode: 400, error: 'User email is the current logged in user.' };
  }

  const nameUsed = database.quizzes.some(
    q => q.name === quiz.name && q.creatorId === newOwner.userId && q.quizId !== quizId
  );
  if (nameUsed) {
    return { statusCode: 400, error: 'Quiz ID refers to a quiz that has a name that is already used by the target user.' };
  }

  quiz.creatorId = newOwner.userId;
  setData(database);
  return {};
}

/**
 * Duplicate a quiz question.
 *
 * @param {string} token - The session token of the current user.
 * @param {number} quizId - The ID of the quiz containing the question to duplicate.
 * @param {number} questionId - The ID of the question to duplicate.
 * @returns {ErrorMessage | { newQuestionId: number }} - The result of the duplication operation.
 */
export function adminQuizQuestionDuplicate(
  token: string,
  quizId: number,
  questionId: number
): ErrorMessage | { newQuestionId: number } {
  const database = getData();
  const user = findUserBySessionId(database, token);

  if (!user) {
    return { statusCode: 401, error: 'Token is not valid.' };
  }

  const quiz = findQuizWithId(database, quizId);
  if (!quiz) {
    return { statusCode: 403, error: `Quiz with ID '${quizId}' not found` };
  }

  if (quiz.creatorId !== user.userId) {
    return { statusCode: 403, error: 'User is not the owner of the quiz.' };
  }

  if (!quiz.questions) {
    quiz.questions = [];
  }

  const question = quiz.questions.find(q => q.questionId === questionId);
  if (!question) {
    return { statusCode: 400, error: 'Question ID does not refer to a valid question within this quiz.' };
  }

  const newQuestionId = parseInt(questionUid.seq());
  const timeLastEdited = Math.floor(Date.now() / 1000);
  const newQuestion = {
    ...question,
    questionId: newQuestionId
  };

  quiz.questions.push(newQuestion);
  quiz.timeLastEdited = timeLastEdited;

  setData(database);

  return { newQuestionId };
}

/**
 * Update questions for quizzes
 * Each answer is assigned a random colour code.
 *
 * @param {number} quizId - unique id of a quiz
 * @param {number} questionId - unique id of a question
 * @param {QuestionBody} questionBody - contains information of a question
 * @param {string} token - unique session id of a user
 * @returns {} - an empty object
 * @returns {ErrorMessage} an error
 */

export function adminQuizQuestionUpdate(
  quizId: number,
  questionId: number,
  questionBody: QuestionBody,
  token: string
): UserUpdateResult | ErrorMessage {
  const database = getData();
  const user = findUserBySessionId(database, token);

  if (!user) {
    return { statusCode: 401, error: 'Token does not exist or is invalid' };
  }

  const quiz = findQuizWithId(database, quizId);
  if (!quiz) {
    return { statusCode: 403, error: 'Quiz does not exist' };
  } else if (quiz.creatorId !== user.userId) {
    return { statusCode: 403, error: 'User is not an owner of this quiz' };
  }

  const question = quiz.questions.find(
    question => question.questionId === questionId
  );

  if (!question) {
    return {
      statusCode: 400,
      error: 'Question Id does not refer to a valid question within the quiz'
    };
  }

  const totalDuration = quiz.duration + questionBody.duration - question.duration;
  if (typeof validQuestion(questionBody, totalDuration) === 'object') {
    return validQuestion(questionBody, totalDuration) as ErrorMessage;
  }

  question.question = questionBody.question;
  question.duration = questionBody.duration;
  question.points = questionBody.points;
  question.answers = questionBody.answers.map(ans => ({ ...ans }));
  for (const ans of question.answers) {
    ans.answerId = parseInt(answerUid.seq());
    ans.colour = getRandomColour();
  }
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  quiz.duration = totalDuration;
  setData(database);
  return { };
}

/**
 * move the quiz position
 *
 * @param {number} quizId - the quizId we want to move
 * @param {number} questionId - the questionId we want to move
 * @param {PositionWithTokenObj} moveinfo - the object contain the position we want to move and token who made request
 * @returns {} - empty object
 * @returns {{statusCode: number, error: string}} an error
 */
export function adminQuizQuestionMove(
  quizId: number,
  questionId: number,
  moveInfo: PositionWithTokenObj
): QuizQuestionMoveResult {
  const database = getData();
  const user = findUserBySessionId(database, moveInfo.token);
  if (!user) {
    return { statusCode: 401, error: 'Token is empty or invalid.' };
  }
  const quiz = findQuizWithId(database, quizId);
  if (!quiz) {
    return { statusCode: 403, error: 'Quiz does not exist' };
  } else if (quiz.creatorId !== user.userId) {
    return { statusCode: 403, error: 'User is is not owner of quiz' };
  }
  const question = findQuestionInQuizId(database, quizId, questionId);
  const questionIndex = findQuestionIndex(database, quizId, questionId);
  const maxPosition = quiz.questions.length - 1;
  if (!question) {
    return {
      statusCode: 400,
      error: 'Question Id does not refer to a valid question within this quiz'
    };
  } else if (moveInfo.newPosition > maxPosition || moveInfo.newPosition < 0) {
    return {
      statusCode: 400,
      error: 'NewPosition is less than 0, or NewPosition is greater than n-1 where n is the number of questions'
    };
  } else if (moveInfo.newPosition === questionIndex) {
    return {
      statusCode: 400,
      error: 'NewPosition is the position of the current question'
    };
  }
  // swap them
  [quiz.questions[questionIndex], quiz.questions[moveInfo.newPosition]] = [quiz.questions[moveInfo.newPosition], quiz.questions[questionIndex]];
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
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
    return { statusCode: 401, message: 'Token is empty or invalid.' };
  }

  const quizIndex = database.trash.findIndex(quiz => quiz.quizId === quizId);
  

  const quiz = database.trash[quizIndex];
  if (quiz.creatorId !== user.userId) {
    return { statusCode: 403, message: `User is not the owner of quiz with ID '${quizId}'.` };
  }

  // Check if quiz name is already used by another active quiz
  if (database.quizzes.some(activeQuiz => activeQuiz.name === quiz.name)) {
    return { statusCode: 400, message: `Quiz name '${quiz.name}' is already used by another active quiz.` };
  }

  if (quizIndex === -1) {
    return { statusCode: 400, message: `Quiz ID '${quizId}' does not refer to a quiz in the trash.` };
  }
  // Restore the quiz
  quiz.timeLastEdited = Date.now();
  database.quizzes.push(quiz);
  database.trash.splice(quizIndex, 1);

  setData(database);
  return { statusCode: 200, message: '{}' };
}

/**
 * Deletes a question from a quiz.
 * @param {string} token The session token of the user.
 * @param {number} quizId The ID of the quiz.
 * @param {number} questionId The ID of the question to be deleted.
 * @returns {} An empty object
 * @returns {ErrorMessage} An error message
 */
export function adminQuizQuestionDelete(token: string, quizId: number, questionId: number): QuizQuestionDeleteResult {
  const database = getData();
  const user = findUserBySessionId(database, token);

  if (!user) {
    return { statusCode: 401, message: 'Token is empty or invalid.' };
  }

  const quiz = findQuizWithId(database, quizId);
  if (!quiz) {
    return { statusCode: 403, message: `Quiz with ID '${quizId}' does not exist.` };
  }

  if (quiz.creatorId !== user.userId) {
    return { statusCode: 403, message: `User is not the owner of quiz with ID '${quizId}'.` };
  }

  const questionIndex = quiz.questions.findIndex(question => question.questionId === questionId);
  if (questionIndex === -1) {
    return { statusCode: 400, message: `Question ID '${questionId}' does not refer to a valid question within quiz '${quizId}'.` };
  }

  // Delete the question
  quiz.questions.splice(questionIndex, 1);
  quiz.timeLastEdited = Date.now();

  setData(database);
  return { statusCode: 200, message: '{}' };
}

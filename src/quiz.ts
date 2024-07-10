import { getData, setData } from './dataStore';
import { durationSum, findQuizWithId, findUserBySessionId, validAnswers } from './helpers';
import { CreateQuestionReturn, EmptyObject, ErrorMessage, QuestionBody, Quiz, QuizIdObject, QuizInfoResult, TrashViewDetails, QuizListDetails, QuizRemoveResult,  QuizRestoreResult, QuizQuestionDeleteResult } from './types';
import ShortUniqueId from 'short-unique-id';
import { randomColor } from 'seed-to-color';
const uid = new ShortUniqueId({ dictionary: 'number' });
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
 * @returns {{error: string}} an error
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
  const id = database.quizzes.length + 1;
  database.quizzes.push({
    creatorId: user.userId,
    quizId: id,
    name: name,
    timeCreated: timeStamp1,
    timeLastEdited: timeStamp2,
    description: description,
    questions: []
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
 * @param {number} sessionId - unique id of a user
 * @param {number} quizId - unique id of a quiz
 * @returns {{quizId: number, name: string, timeCreated: number,
 *            timeLastEdited: number, description: string}}
 * @returns {{error: string}} an error
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
  }

  if (quiz.creatorId !== user.userId) {
    return { statusCode: 403, error: `Quiz with ID ${quizId} is not owned by ${user.userId} (actual owner: ${quiz.creatorId})` };
  }

  return {
    quizId: quiz.quizId,
    name: quiz.name,
    timeCreated: quiz.timeCreated,
    timeLastEdited: quiz.timeLastEdited,
    description: quiz.description,
    questions: quiz.questions
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
 * @param {number} authUserId - unique id of a user
 * @param {number} quizId - unique id of a quiz
 * @param {string} description - description of a quiz
 * @returns {} - empty object
 * @returns {{error: string}} an error
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
 * Update the description of the relevant quiz.
 *
 * @param {number} quizId - unique id of a quiz
 * @param {string} token - unique session id of a quiz
 * @param {QuestionBody} questionBody - contains information of a question
 * @returns {{questionId: number}} - id of a question that is unique only inside a quiz
 * @returns {{error: string}} an error
 */

export function adminCreateQuizQuestion(
  quizId: number,
  token: string,
  questionBody: QuestionBody): CreateQuestionReturn {
  const database = getData();
  const user = findUserBySessionId(database, token);
  if (!user) {
    return { statusCode: 401, error: 'Session ID is invalid' };
  }
  const quiz = findQuizWithId(database, quizId);
  if (!quiz) {
    return { statusCode: 403, error: 'Quiz does not exist' };
  } else if (quiz.creatorId !== user.userId) {
    return { statusCode: 403, error: 'User is is not owner of quiz' };
  }
  const totalDuration = durationSum(database, quizId) + questionBody.duration;
  console.log('duration is ', totalDuration);
  if (questionBody.question.length > 50) {
    return { statusCode: 400, error: 'Question string is greater than 50 characters' };
  } else if (questionBody.question.length < 5) {
    return { statusCode: 400, error: 'Question string is less than 5 characters' };
  } else if (questionBody.answers.length < 2) {
    return { statusCode: 400, error: 'There are less than 2 answers' };
  } else if (questionBody.answers.length > 6) {
    return { statusCode: 400, error: 'There are more than 6 answers' };
  } else if (questionBody.duration < 0) {
    return { statusCode: 400, error: 'Duration is negative' };
  } else if (totalDuration > 180) {
    return { statusCode: 400, error: 'Total duration is more than 3 min' };
  } else if (questionBody.points < 1) {
    return { statusCode: 400, error: 'Point is less than 1' };
  } else if (questionBody.points > 10) {
    return { statusCode: 400, error: 'Point is greater than 10' };
  } else if (typeof validAnswers(questionBody) === 'object') {
    return validAnswers(questionBody) as ErrorMessage;
  }
  const questionId = parseInt(uid.rnd());
  questionBody.questionId = questionId;
  for (const ans of questionBody.answers) {
    ans.answerId = parseInt(uid.rnd());
    ans.colour = randomColor(ans.answerId);
  }
  quiz.questions.push(questionBody);
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  setData(database);
  return { questionId: questionId };
}

/**
 * Given a token/sessionId, view the quizzes that are currently in the trash for
 * logged in user.
 *
 * @param {string} sessionId - unique id of a user
 * @returns {{quizzes: {quizId: number, name: string}}} - an object containing identifiers of all quizzes
 * @returns {{error: string}} an error
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
 * Restores a quiz from the trash.
 * @param token The session token of the user.
 * @param quizId The ID of the quiz to be restored.
 * @returns The result of the restore operation.
 */
export function adminQuizRestore(token: string, quizId: number): QuizRestoreResult {
  const database = getData();
  const user = findUserBySessionId(database, token);

  if (!user) {
    return { statusCode: 401, message: 'Token is empty or invalid.' };
  }

  const quizIndex = database.trash.findIndex(quiz => quiz.quizId === quizId);
  if (quizIndex === -1) {
    return { statusCode: 400, message: `Quiz ID '${quizId}' does not refer to a quiz in the trash.` };
  }

  const quiz = database.trash[quizIndex];
  if (quiz.creatorId !== user.userId) {
    return { statusCode: 403, message: `User is not the owner of quiz with ID '${quizId}'.` };
  }

  // Check if quiz name is already used by another active quiz
  if (database.quizzes.some(activeQuiz => activeQuiz.name === quiz.name)) {
    return { statusCode: 400, message: `Quiz name '${quiz.name}' is already used by another active quiz.` };
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
 * @param token The session token of the user.
 * @param quizId The ID of the quiz.
 * @param questionId The ID of the question to be deleted.
 * @returns The result of the delete operation.
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

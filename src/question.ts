import { getData, setData } from './dataStore';

import {
  findQuizWithId,
  findUserBySessionId,
  findQuestionInQuizId,
  findQuestionIndex,
  validQuestion,
  getRandomColour
} from './helpers';
import {
  CreateQuestionReturn,
  ErrorMessage,
  QuestionBody,
  QuizQuestionDeleteResult,
  UserUpdateResult,
  PositionWithTokenObj,
  QuizQuestionMoveResult
} from './types';

import ShortUniqueId from 'short-unique-id';
import { Unauthorised, BadRequest, Forbidden } from './error';
const answerUid = new ShortUniqueId({ dictionary: 'number' });
const questionUid = new ShortUniqueId({ dictionary: 'number' });

export enum Colours {
  red = 'red',
  blue = 'blue',
  green = 'green',
  yellow = 'yellow',
  purple = 'purple',
  brown = 'brown',
  orange = 'orange'
}

/**
 * Create questions for quizzes given the contents of the question and
 * generate unique ids for the questions as well as the answers inside it.
 * Each answer is assigned a random colour code.
 *
 * @param {number} quizId - unique id of a quiz
 * @param {string} token - unique session id of a quiz
 * @param {QuestionBody} questionBody - contains information of a question
 * @returns {{questionId: number}} - id of a question that is unique only inside a quiz
 * @returns {ErrorMessage} an error
 */
export function adminCreateQuizQuestion(
  quizId: number,
  token: string,
  questionBody: QuestionBody,
  v2?: boolean): CreateQuestionReturn {
  const database = getData();
  const user = findUserBySessionId(database, token);
  if (!user) {
    throw new Unauthorised('Session ID is invalid');
  }
  const quiz = findQuizWithId(database, quizId);
  if (!quiz) {
    throw new Forbidden('Quiz does not exist');
  } else if (quiz.creatorId !== user.userId) {
    throw new Forbidden('User is not an owner of quiz');
  }
  const totalDuration = quiz.duration + questionBody.duration;
  const isValidQuestion = validQuestion(questionBody, totalDuration);
  if (typeof isValidQuestion === 'string') {
    throw new BadRequest(isValidQuestion as string);
  }
  const validExtensions = /\.(jpg|jpeg|png)$/i;
  const validProtocol = /^https?:\/\//;
  if (v2 === true) {
    if (questionBody.thumbnailUrl === '') {
      throw new BadRequest('Thumbnail url is an empty string');
    } else if (!validExtensions.test(questionBody.thumbnailUrl)) {
      throw new BadRequest('Not valid file type for thumbnail');
    } else if (!validProtocol.test(questionBody.thumbnailUrl)) {
      throw new BadRequest('Invalid https protocol');
    }
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
  quiz.numQuestions += 1;
  setData(database);
  return { questionId: questionId };
}

/**
 * Duplicate a quiz question.
 *
 * @param {string} token - The session token of the current user.
 * @param {number} quizId - The ID of the quiz containing the question to duplicate.
 * @param {number} questionId - The ID of the question to duplicate.
 * @returns {{ newQuestionId: number }} - The result of the duplication operation.
 */
export function adminQuizQuestionDuplicate(
  token: string,
  quizId: number,
  questionId: number
):{ newQuestionId: number } {
  const database = getData();
  const user = findUserBySessionId(database, token);

  if (!user) {
    throw new Unauthorised('Token is not valid.');
  }

  const quiz = findQuizWithId(database, quizId);
  if (!quiz) {
    throw new Forbidden(`Quiz with ID '${quizId}' not found`);
  }

  if (quiz.creatorId !== user.userId) {
    throw new Forbidden('User is not the owner of the quiz.');
  }

  if (!quiz.questions) {
    throw new BadRequest('Question ID does not refer to a valid question within this quiz.');
  }
  const question = quiz.questions.find(q => q.questionId === questionId);
  if (!question) {
    throw new BadRequest('Question ID does not refer to a valid question within this quiz.');
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
  const quiz = findQuizWithId(database, quizId);

  const question = quiz.questions.find(
    question => question.questionId === questionId
  );

  if (!question) {
    throw new BadRequest('Question Id does not refer to a valid question within the quiz');
  }

  const totalDuration = quiz.duration + questionBody.duration - question.duration;
  const isValidQuestion = validQuestion(questionBody, totalDuration);
  if (typeof isValidQuestion === 'string') {
    throw new BadRequest(isValidQuestion as string);
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
 * @param {PositionWithTokenObj} moveInfo - the object contain the position we want to move and token who made request
 * @returns {} - empty object
 */
export function adminQuizQuestionMove(
  quizId: number,
  questionId: number,
  moveInfo: PositionWithTokenObj
): QuizQuestionMoveResult {
  const database = getData();
  const quiz = findQuizWithId(database, quizId);
  const question = findQuestionInQuizId(database, quizId, questionId);
  const questionIndex = findQuestionIndex(database, quizId, questionId);
  const maxPosition = quiz.questions.length - 1;
  if (!question) {
    throw new BadRequest('Question Id does not refer to a valid question within this quiz');
  } else if (moveInfo.newPosition > maxPosition || moveInfo.newPosition < 0) {
    throw new BadRequest('NewPosition is less than 0, or NewPosition is greater than n-1 where n is the number of questions');
  } else if (moveInfo.newPosition === questionIndex) {
    throw new BadRequest('NewPosition is the position of the current question');
  }
  // swap them
  [quiz.questions[questionIndex], quiz.questions[moveInfo.newPosition]] = [quiz.questions[moveInfo.newPosition], quiz.questions[questionIndex]];
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  setData(database);

  return {};
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
    throw new Unauthorised('Token is empty or invalid.');
  }

  const quiz = findQuizWithId(database, quizId);
  if (!quiz) {
    throw new Forbidden(`Quiz with ID '${quizId}' does not exist.`);
  }

  if (quiz.creatorId !== user.userId) {
    throw new Forbidden(`User is not the owner of quiz with ID '${quizId}'.`);
  }

  const questionIndex = quiz.questions.findIndex(question => question.questionId === questionId);
  if (questionIndex === -1) {
    throw new BadRequest(`Question ID '${questionId}' does not refer to a valid question within quiz '${quizId}'.`);
  }

  // Delete the question
  quiz.questions.splice(questionIndex, 1);
  quiz.timeLastEdited = Date.now();

  setData(database);
  return {};
}


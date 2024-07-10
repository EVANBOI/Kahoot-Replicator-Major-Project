// quizRestore.test.ts

import { adminQuizRestore, adminAuthRegister, clear } from '../wrappers';
import { SessionIdObject, QuizIdObject } from '../types';
import { adminQuizCreate, adminQuizRemove } from '../quiz';

const VALID_USER_INPUT = {
  EMAIL: 'admin@email.com',
  PASSWORD: 'password1',
  FIRSTNAME: 'Idk',
  LASTNAME: 'Idk'
};
const VALID_USER_INPUT2 = {
  EMAIL: 'admin2@email.com',
  PASSWORD: 'password1',
  FIRSTNAME: 'Idka',
  LASTNAME: 'Idka'
};

let sessionId: string;
let sessionId2: string;
let validQuizId: number;
let validQuizId2: number;

beforeEach(() => {
  clear();
  sessionId = (adminAuthRegister(
    VALID_USER_INPUT.EMAIL,
    VALID_USER_INPUT.PASSWORD,
    VALID_USER_INPUT.FIRSTNAME,
    VALID_USER_INPUT.LASTNAME
  ).jsonBody as SessionIdObject).token;
  sessionId2 = (adminAuthRegister(
    VALID_USER_INPUT2.EMAIL,
    VALID_USER_INPUT2.PASSWORD,
    VALID_USER_INPUT2.FIRSTNAME,
    VALID_USER_INPUT2.LASTNAME
  ).jsonBody as SessionIdObject).token;
  validQuizId = (adminQuizCreate(sessionId, 'dummyquiz', 'This is a dummy quiz for testing') as QuizIdObject).quizId;
  validQuizId2 = (adminQuizCreate(sessionId2, 'dummyquiz', 'This is a dummy quiz for testing') as QuizIdObject).quizId;

  // Move the quizzes to trash
  adminQuizRemove(sessionId, validQuizId);
  adminQuizRemove(sessionId2, validQuizId2);
});

test('should successfully restore a quiz', () => {
  const result = adminQuizRestore({
    token: sessionId,
    quizId: validQuizId
  });
  expect(result).toEqual({
    statusCode: 200,
    jsonBody: {}
  });
});

test('should return an error when restoring a quiz with an invalid sessionId', () => {
  const result = adminQuizRestore({
    token: sessionId + 696969,
    quizId: validQuizId
  });
  expect(result).toStrictEqual({
    statusCode: 401,
    jsonBody: {
      error: expect.any(String),
    },
  });
});



test('should return an error when restoring a quiz that the user does not own', (): void => {
  const result = adminQuizRestore({
    token: sessionId,
    quizId: validQuizId2
  });
  expect(result).toStrictEqual({
    statusCode: 403,
    jsonBody: {
      error: expect.any(String),
    },
  });
});

test('should return an error when restoring a quiz with an invalid quizId', (): void => {
    const result = adminQuizRestore({
      token: sessionId,
      quizId: validQuizId + 1029
    });
    expect(result).toStrictEqual({
      statusCode: 400,
      jsonBody: {
        error: expect.any(String),
      },
    });
  });
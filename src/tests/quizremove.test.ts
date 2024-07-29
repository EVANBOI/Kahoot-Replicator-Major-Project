import { adminQuizRemove, adminAuthRegister, clear } from '../wrappers';
import { TokenObject, QuizIdObject } from '../types';
import { adminQuizCreate } from '../quiz';

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

// Clear the state before each test
let sessionId: string;
let sessionId2: string;
let validQuizId2: number;
let validQuizId: number;
beforeEach(() => {
  clear();
  sessionId = (adminAuthRegister(
    VALID_USER_INPUT.EMAIL,
    VALID_USER_INPUT.PASSWORD,
    VALID_USER_INPUT.FIRSTNAME,
    VALID_USER_INPUT.LASTNAME
  ).jsonBody as TokenObject).token;
  sessionId2 = (adminAuthRegister(
    VALID_USER_INPUT2.EMAIL,
    VALID_USER_INPUT2.PASSWORD,
    VALID_USER_INPUT2.FIRSTNAME,
    VALID_USER_INPUT2.LASTNAME
  ).jsonBody as TokenObject).token;
  validQuizId = (adminQuizCreate(sessionId, 'dummyquiz', 'This is a dummy quiz for testing') as QuizIdObject).quizId;
  validQuizId2 = (adminQuizCreate(sessionId2, 'dummyquiz', 'This is a dummy quiz for testing') as QuizIdObject).quizId;
});

// create a valid qui

test('should successfully remove a quiz', () => {
  const result = adminQuizRemove(sessionId, validQuizId);
  expect(result).toEqual({
    jsonBody: {},
    statusCode: 200,
  });
});

test('should return an error when removing a quiz with an invalid sessionId', () => {
  const result = adminQuizRemove(sessionId + 1241, validQuizId);

  expect(result).toStrictEqual({
    jsonBody: {
      error: expect.any(String),
    },
    statusCode: 401,
  });
});

test('should return an error when removing a quiz with an invalid quizId', (): void => {
  const result = adminQuizRemove(sessionId, validQuizId + 1029);
  expect(result).toStrictEqual({
    jsonBody: {
      error: expect.any(String),
    },
    statusCode: 403,
  });
});

test('should return an error when removing a quiz that the user does not own', (): void => {
  const result = adminQuizRemove(sessionId, validQuizId2);
  expect(result).toStrictEqual({
    jsonBody: {
      error: expect.any(String),
    },
    statusCode: 403,
  });
});

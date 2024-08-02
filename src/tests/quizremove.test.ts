import { 
  adminQuizRemove, 
  adminAuthRegister, 
  clear, adminQuizCreate, 
  adminQuizRemoveV2,
  adminCreateQuizQuestionV2, 
  adminQuizSessionStart
} from '../wrappers';
import { TokenObject } from '../types';
import { validQuestion1V2 } from '../testConstants';
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
  validQuizId = adminQuizCreate(sessionId, 'dummyquiz', 'This is a dummy quiz for testing').jsonBody.quizId;
  validQuizId2 = adminQuizCreate(sessionId2, 'dummyquiz', 'This is a dummy quiz for testing').jsonBody.quizId;
});

describe('v1 route successful', () => {
  test('should successfully remove a quiz', () => {
    const result = adminQuizRemove(sessionId, validQuizId);
    expect(result).toEqual({
      jsonBody: {},
      statusCode: 200,
    });
  });
})

describe('v1 route unsuccessful', () => {
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
})

// v2 route tests
describe('v2 route successful', () => {
  test('should successfully remove a quiz', () => {
    const result = adminQuizRemoveV2(sessionId, validQuizId);
    expect(result).toEqual({
      jsonBody: {},
      statusCode: 200,
    });
  });
})

describe('v2 route unsuccessful', () => {
  test('should return an error when removing a quiz with an invalid sessionId', () => {
    const result = adminQuizRemoveV2(sessionId + 1241, validQuizId);
    expect(result).toStrictEqual({
      jsonBody: {
        error: expect.any(String),
      },
      statusCode: 401,
    });
  });
  
  test('should return an error when removing a quiz with an invalid quizId', (): void => {
    const result = adminQuizRemoveV2(sessionId, validQuizId + 1029);
    expect(result).toStrictEqual({
      jsonBody: {
        error: expect.any(String),
      },
      statusCode: 403,
    });
  });
  
  test('should return an error when removing a quiz that the user does not own', (): void => {
    const result = adminQuizRemoveV2(sessionId, validQuizId2);
    expect(result).toStrictEqual({
      jsonBody: {
        error: expect.any(String),
      },
      statusCode: 403,
    });
  });

  test('should return an error when at least 1 quiz session has not ended', (): void => {
    adminCreateQuizQuestionV2(validQuizId, sessionId, validQuestion1V2);
    adminQuizSessionStart(validQuizId, sessionId, 2);
    const result = adminQuizRemoveV2(sessionId, validQuizId);
    expect(result).toStrictEqual({
      jsonBody: {
        error: expect.any(String),
      },
      statusCode: 400,
    });
  });
})


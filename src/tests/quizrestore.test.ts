import { 
  adminQuizRestore, 
  adminQuizRestoreV2,
  adminAuthRegister, 
  clear, 
  adminQuizRemove, 
  adminQuizInfo, 
  adminQuizRemoveV2
} from '../wrappers';
import { adminQuizCreate } from '../quiz';
import { TokenObject, QuizIdObject } from '../types';

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
let validQuizId: number;
let validQuizId2: number;

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
  validQuizId2 = (adminQuizCreate(sessionId2, 'dummyquiz2', 'This is a dummy quiz for testing') as QuizIdObject).quizId;
});

// v1 route tests
describe('success cases for v1', () => {
  test('should successfully restore a quiz', () => {
    // Move the quiz to trash before restoring
    adminQuizRemove(sessionId, validQuizId);
    const result = adminQuizRestore(sessionId, validQuizId);
    expect(result).toEqual({
      jsonBody: {},
      statusCode: 200,
    });

    // Verify the quiz is actually restored
    const quizInfo = adminQuizInfo(sessionId, validQuizId);
    expect(quizInfo.statusCode).toBe(200);
    expect(quizInfo.jsonBody.quizId).toBe(validQuizId);
    expect(quizInfo.jsonBody.name).toBe('dummyquiz');
  });
})

describe('failure cases for v1', () => {
  test('should return an error when restoring a quiz with an invalid quizId', (): void => {
    // Move the quiz to trash before restoring
    adminQuizRemove(sessionId, validQuizId);
    const result = adminQuizRestore(sessionId, validQuizId2);
    expect(result).toStrictEqual({
      jsonBody: {
        error: expect.any(String),
      },
      statusCode: 400,
    });
  });

  test('should return an error when restoring a quiz with an invalid sessionId', () => {
    // Move the quiz to trash before restoring
    adminQuizRemove(sessionId, validQuizId);
    const result = adminQuizRestore(sessionId + 'invalid', validQuizId);
    expect(result).toStrictEqual({
      jsonBody: {
        error: expect.any(String),
      },
      statusCode: 401,
    });
  });

  test('should return an error when restoring a quiz with an invalid quizId', (): void => {
    // Move the quiz to trash before restoring
    adminQuizRemove(sessionId, validQuizId);
    const result = adminQuizRestore(sessionId, validQuizId + 1029);
    expect(result).toStrictEqual({
      jsonBody: {
        error: expect.any(String),
      },
      statusCode: 403,
    });
  });
})


// v2 route tests
describe('success cases for v2', () => {
  test('should return an error when restoring a quiz with an invalid sessionId', () => {
    // Move the quiz to trash before restoring
    adminQuizRemoveV2(sessionId, validQuizId);

    const result = adminQuizRestore(sessionId + 'invalid', validQuizId);
    expect(result).toStrictEqual({
      jsonBody: {
        error: expect.any(String),
      },
      statusCode: 401,
    });
  });

  test('should return an error when restoring a quiz with an invalid quizId', (): void => {
    // Move the quiz to trash before restoring
    adminQuizRemoveV2(sessionId, validQuizId);

    const result = adminQuizRestore(sessionId, validQuizId + 1029);
    expect(result).toStrictEqual({
      jsonBody: {
        error: expect.any(String),
      },
      statusCode: 403,
    });
  });
})

describe('Failure cases for v2', () => {
  test('should return an error when restoring a quiz with an invalid sessionId', () => {
    // Move the quiz to trash before restoring
    adminQuizRemoveV2(sessionId, validQuizId);

    const result = adminQuizRestore(sessionId + 'invalid', validQuizId);
    expect(result).toStrictEqual({
      jsonBody: {
        error: expect.any(String),
      },
      statusCode: 401,
    });
  });

  test('should return an error when restoring a quiz with an invalid quizId', (): void => {
    // Move the quiz to trash before restoring
    adminQuizRemoveV2(sessionId, validQuizId);

    const result = adminQuizRestore(sessionId, validQuizId + 1029);
    expect(result).toStrictEqual({
      jsonBody: {
        error: expect.any(String),
      },
      statusCode: 403,
    });
  });

  test('should return an error when restoring a quiz that the user does not own', (): void => {
    // Move the quiz to trash before restoring
    adminQuizRemoveV2(sessionId2, validQuizId2);

    const result = adminQuizRestore(sessionId, validQuizId2);
    expect(result).toStrictEqual({
      jsonBody: {
        error: expect.any(String),
      },
      statusCode: 403,
    });
  });
  test('should return an error when restoring a quiz with an invalid quizId', (): void => {
    // Move the quiz to trash before restoring
    adminQuizRemoveV2(sessionId, validQuizId);

    const result = adminQuizRestore(sessionId, validQuizId2);
    expect(result).toStrictEqual({
      jsonBody: {
        error: expect.any(String),
      },
      statusCode: 400,
    });
  });
});

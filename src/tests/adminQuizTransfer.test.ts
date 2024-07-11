import {
  adminAuthRegister,
  adminQuizCreate,
  adminQuizTransfer,
  adminQuizInfo,
  clear
} from '../wrappers';
import { ok } from '../helpers';

const VALID_INPUTS = {
  EMAIL: 'changli@unsw.edu.au',
  PASSWORD: 'Password123',
  FIRSTNAME: 'Chang',
  LASTNAME: 'Li',
};

const ERROR400 = {
  statusCode: 400,
  jsonBody: { error: expect.any(String) },
};

const ERROR401 = {
  statusCode: 401,
  jsonBody: { error: expect.any(String) },
};

const ERROR403 = {
  statusCode: 403,
  jsonBody: { error: expect.any(String) },
};

const SUCCESSFUL_TRANSFER = {
  statusCode: 200,
  jsonBody: {},
};

let sessionId: string;
let quizId: number;
let newOwnerEmail: string;
let validToken: string;

beforeEach(() => {
  clear();
});

describe('adminQuizTransfer tests', () => {
  beforeEach(() => {
    const registerResponse = adminAuthRegister(VALID_INPUTS.EMAIL, VALID_INPUTS.PASSWORD, VALID_INPUTS.FIRSTNAME, VALID_INPUTS.LASTNAME);
    sessionId = registerResponse.jsonBody.token;

    const quizCreateResponse = adminQuizCreate(sessionId, 'My Quiz', 'This is a description.');
    quizId = quizCreateResponse.jsonBody.quizId;

    const newUserRegisterResponse = adminAuthRegister('newuser@unsw.edu.au', 'Password123', 'New', 'User');
    newOwnerEmail = 'newuser@unsw.edu.au';
    validToken = newUserRegisterResponse.jsonBody.token;
  });

  test('Invalid session ID', () => {
    const result = adminQuizTransfer('invalidSessionId', quizId, newOwnerEmail);
    expect(result).toStrictEqual(ERROR401);
  });

  test('Invalid quiz ID', () => {
    const result = adminQuizTransfer(sessionId, quizId + 42, newOwnerEmail);
    expect(result).toStrictEqual(ERROR403);
  });

  test('User email is not a real user', () => {
    const result = adminQuizTransfer(sessionId, quizId, 'fakeuser@unsw.edu.au');
    expect(result).toStrictEqual(ERROR400);
  });

  test('User email is the current logged in user', () => {
    const result = adminQuizTransfer(sessionId, quizId, VALID_INPUTS.EMAIL);
    expect(result).toStrictEqual(ERROR400);
  });

  test('Quiz ID refers to a quiz that has a name that is already used by the target user', () => {
    adminQuizCreate(validToken, 'My Quiz', 'Another description.');
    const result = adminQuizTransfer(sessionId, quizId, newOwnerEmail);
    expect(result).toStrictEqual(ERROR400);
  });

  test('Successful quiz transfer - correct return value', () => {
    const result = adminQuizTransfer(sessionId, quizId, newOwnerEmail);
    expect(result).toStrictEqual(SUCCESSFUL_TRANSFER);
  });

  test('Successful quiz transfer - functionality', () => {
    adminQuizTransfer(sessionId, quizId, newOwnerEmail);
    const updatedQuiz = ok(adminQuizInfo(validToken, quizId));
    expect(updatedQuiz).toStrictEqual({
      statusCode: 200,
      jsonBody: {
        quizId: expect.any(Number),
        name: 'My Quiz',
        questions: expect.any(Array),
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'This is a description.',
        duration: expect.any(Number)
      },
    });
  });
});

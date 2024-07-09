import { adminAuthRegister, adminQuizCreate, adminQuizNameUpdate, adminQuizInfo, clear } from '../wrappers';
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

const SUCCESSFUL_UPDATE = {
  statusCode: 200,
  jsonBody: {},
};

let sessionId: string;
let quizId: number;

beforeEach(() => {
  clear();
});
describe('adminQuizNameUpdate tests', () => {
  beforeEach(() => {
    const registerResponse = adminAuthRegister(VALID_INPUTS.EMAIL, VALID_INPUTS.PASSWORD, VALID_INPUTS.FIRSTNAME, VALID_INPUTS.LASTNAME);
    sessionId = registerResponse.jsonBody.token;
    const quizCreateResponse = adminQuizCreate(sessionId, 'My Quiz', 'This is a description.');
    quizId = quizCreateResponse.jsonBody.quizId;
  });

  test('Invalid session ID', () => {
    const result = adminQuizNameUpdate('invalidSessionId', quizId, 'New Quiz Name');
    expect(result).toStrictEqual(ERROR401);
  });

  test('Invalid quiz ID', () => {
    const result = adminQuizNameUpdate(sessionId, quizId + 42, 'New Quiz Name');
    expect(result).toStrictEqual(ERROR403);
  });

  test('Quiz not owned by user', () => {
    const anotherRegisterResponse = adminAuthRegister('another.user@unsw.edu.au', 'Password123', 'Another', 'User');
    const anotherSessionId = anotherRegisterResponse.jsonBody.token;
    const result = adminQuizNameUpdate(anotherSessionId, quizId, 'New Quiz Name');
    expect(result).toStrictEqual(ERROR403);
  });

  test('Name contains invalid characters', () => {
    const result = adminQuizNameUpdate(sessionId, quizId, 'Invalid@Name');
    expect(result).toStrictEqual(ERROR400);
  });

  test('Name too short', () => {
    const result = adminQuizNameUpdate(sessionId, quizId, 'AB');
    expect(result).toStrictEqual(ERROR400);
  });

  test('Name too long', () => {
    const longName = 'A'.repeat(31);
    const result = adminQuizNameUpdate(sessionId, quizId, longName);
    expect(result).toStrictEqual(ERROR400);
  });

  test('Name already used by user', () => {
    adminQuizCreate(sessionId, 'Existing Quiz', 'Another description.');
    const result = adminQuizNameUpdate(sessionId, quizId, 'Existing Quiz');
    expect(result).toStrictEqual(ERROR400);
  });

  test('Successful quiz name update - correct return value', () => {
    const result = adminQuizNameUpdate(sessionId, quizId, 'New Quiz Name');
    expect(result).toStrictEqual(SUCCESSFUL_UPDATE);
  });

  test('Successful quiz name update - functionality', () => {
    adminQuizNameUpdate(sessionId, quizId, 'New Quiz Name');
    const updatedQuiz = ok(adminQuizInfo(sessionId, quizId));
    expect(updatedQuiz).toStrictEqual({
      statusCode: 200,
      jsonBody: {
        quizId: expect.any(Number),
        name: 'New Quiz Name',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'This is a description.',

      },
    });
  });
});

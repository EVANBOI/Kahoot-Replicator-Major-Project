import {
  adminAuthRegister,
  adminQuizCreate,
  adminQuizNameUpdate,
  adminQuizNameUpdateV2,
  adminQuizInfo,
  clear
} from '../wrappers';
import {
  VALID_USER_REGISTER_INPUTS_1,
  ERROR400,
  ERROR401,
  ERROR403,
  SUCCESSFUL_UPDATE
} from '../testConstants';

let sessionId: string;
let quizId: number;

beforeEach(() => {
  clear();
});

// v1 tests
describe('adminQuizNameUpdate failure cases for v1', () => {
  beforeEach(() => {
    const registerResponse = adminAuthRegister(
      VALID_USER_REGISTER_INPUTS_1.EMAIL,
      VALID_USER_REGISTER_INPUTS_1.PASSWORD,
      VALID_USER_REGISTER_INPUTS_1.FIRSTNAME,
      VALID_USER_REGISTER_INPUTS_1.LASTNAME
    );
    sessionId = registerResponse.jsonBody?.token;
    const quizCreateResponse = adminQuizCreate(sessionId, 'My Quiz', 'This is a description.');
    quizId = quizCreateResponse.jsonBody?.quizId;
  });

  test('Invalid session ID', () => {
    const result = adminQuizNameUpdate('invalidSessionId', quizId, 'New Quiz Name');
    expect(result).toStrictEqual(ERROR401);
  });

  test('Invalid quiz ID', () => {
    const result = adminQuizNameUpdate(sessionId, quizId + 42, 'New Quiz Name');
    expect(result).toStrictEqual(ERROR403);
  });

  test('Name contains invalid characters', () => {
    const result = adminQuizNameUpdate(sessionId, quizId, 'Invalid@Name');
    expect(result).toStrictEqual(ERROR400);
  });
});

describe('adminQuizNameUpdate success cases for v1', () => {
  beforeEach(() => {
    const registerResponse = adminAuthRegister(
      VALID_USER_REGISTER_INPUTS_1.EMAIL,
      VALID_USER_REGISTER_INPUTS_1.PASSWORD,
      VALID_USER_REGISTER_INPUTS_1.FIRSTNAME,
      VALID_USER_REGISTER_INPUTS_1.LASTNAME
    );
    sessionId = registerResponse.jsonBody?.token;
    const quizCreateResponse = adminQuizCreate(sessionId, 'My Quiz', 'This is a description.');
    quizId = quizCreateResponse.jsonBody?.quizId;
  });

  test('Successful quiz name update - correct return value', () => {
    const result = adminQuizNameUpdate(sessionId, quizId, 'New Quiz Name');
    expect(result).toStrictEqual(SUCCESSFUL_UPDATE);
  });
});

// v2 tests
describe('adminQuizNameUpdate failure cases tests for v2', () => {
  beforeEach(() => {
    const registerResponse = adminAuthRegister(
      VALID_USER_REGISTER_INPUTS_1.EMAIL,
      VALID_USER_REGISTER_INPUTS_1.PASSWORD,
      VALID_USER_REGISTER_INPUTS_1.FIRSTNAME,
      VALID_USER_REGISTER_INPUTS_1.LASTNAME
    );
    sessionId = registerResponse.jsonBody?.token;
    const quizCreateResponse = adminQuizCreate(sessionId, 'My Quiz', 'This is a description.');
    quizId = quizCreateResponse.jsonBody?.quizId;
  });

  test('Invalid session ID', () => {
    const result = adminQuizNameUpdateV2('invalidSessionId', quizId, 'New Quiz Name');
    expect(result).toStrictEqual(ERROR401);
  });

  test('Invalid quiz ID', () => {
    const result = adminQuizNameUpdateV2(sessionId, quizId + 42, 'New Quiz Name');
    expect(result).toStrictEqual(ERROR403);
  });

  test('Quiz not owned by user', () => {
    const anotherRegisterResponse = adminAuthRegister('another.user@unsw.edu.au', 'Password123', 'Another', 'User');
    const anotherSessionId = anotherRegisterResponse.jsonBody?.token;
    const result = adminQuizNameUpdateV2(anotherSessionId, quizId, 'New Quiz Name');
    expect(result).toStrictEqual(ERROR403);
  });

  test('Name contains invalid characters', () => {
    const result = adminQuizNameUpdateV2(sessionId, quizId, 'Invalid@Name');
    expect(result).toStrictEqual(ERROR400);
  });

  test('Name too short', () => {
    const result = adminQuizNameUpdateV2(sessionId, quizId, 'AB');
    expect(result).toStrictEqual(ERROR400);
  });

  test('Name too long', () => {
    const longName = 'A'.repeat(31);
    const result = adminQuizNameUpdateV2(sessionId, quizId, longName);
    expect(result).toStrictEqual(ERROR400);
  });

  test('Name already used by user', () => {
    adminQuizCreate(sessionId, 'Existing Quiz', 'Another description.');
    const result = adminQuizNameUpdateV2(sessionId, quizId, 'Existing Quiz');
    expect(result).toStrictEqual(ERROR400);
  });
});

describe('adminQuizNameUpdate success cases tests for v2', () => {
  beforeEach(() => {
    const registerResponse = adminAuthRegister(
      VALID_USER_REGISTER_INPUTS_1.EMAIL,
      VALID_USER_REGISTER_INPUTS_1.PASSWORD,
      VALID_USER_REGISTER_INPUTS_1.FIRSTNAME,
      VALID_USER_REGISTER_INPUTS_1.LASTNAME
    );
    sessionId = registerResponse.jsonBody?.token;
    const quizCreateResponse = adminQuizCreate(sessionId, 'My Quiz', 'This is a description.');
    quizId = quizCreateResponse.jsonBody?.quizId;
  });

  test('Successful quiz name update - correct return value', () => {
    const result = adminQuizNameUpdateV2(sessionId, quizId, 'New Quiz Name');
    expect(result).toStrictEqual(SUCCESSFUL_UPDATE);
  });

  test('Successful quiz name update - functionality', () => {
    adminQuizNameUpdateV2(sessionId, quizId, 'New Quiz Name');
    const updatedQuiz = adminQuizInfo(sessionId, quizId);
    expect(updatedQuiz).toStrictEqual({
      statusCode: 200,
      jsonBody: {
        quizId: expect.any(Number),
        name: 'New Quiz Name',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'This is a description.',
        numQuestions: expect.any(Number),
        questions: [],
        duration: expect.any(Number)
      },
    });
  });
});

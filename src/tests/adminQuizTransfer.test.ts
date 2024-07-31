import {
  adminAuthRegister,
  adminQuizCreate,
  adminQuizTransfer,
  adminQuizInfo,
  clear
} from '../wrappers';
import { ok } from '../helpers';
import {
  VALID_USER_REGISTER_INPUTS_1,
  VALID_USER_REGISTER_INPUTS_2,
  VALID_QUIZ_CREATE_INPUTS_1,
  ERROR400,
  ERROR401,
  ERROR403,
  SUCCESSFUL_TRANSFER
} from '../testConstants';

let sessionId: string;
let quizId: number;
let newOwnerEmail: string;
let validToken: string;

beforeEach(() => {
  clear();
});

describe('adminQuizTransfer tests', () => {
  beforeEach(() => {
    const registerResponse = adminAuthRegister(
      VALID_USER_REGISTER_INPUTS_1.EMAIL,
      VALID_USER_REGISTER_INPUTS_1.PASSWORD,
      VALID_USER_REGISTER_INPUTS_1.FIRSTNAME,
      VALID_USER_REGISTER_INPUTS_1.LASTNAME
    );
    sessionId = registerResponse.jsonBody.token;

    const quizCreateResponse = adminQuizCreate(
      sessionId,
      VALID_QUIZ_CREATE_INPUTS_1.NAME,
      VALID_QUIZ_CREATE_INPUTS_1.DESCRIPTION
    );
    quizId = quizCreateResponse.jsonBody.quizId;

    const newUserRegisterResponse = adminAuthRegister(
      VALID_USER_REGISTER_INPUTS_2.EMAIL,
      VALID_USER_REGISTER_INPUTS_2.PASSWORD,
      VALID_USER_REGISTER_INPUTS_2.FIRSTNAME,
      VALID_USER_REGISTER_INPUTS_2.LASTNAME
    );
    newOwnerEmail = VALID_USER_REGISTER_INPUTS_2.EMAIL;
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
    const result = adminQuizTransfer(sessionId, quizId, VALID_USER_REGISTER_INPUTS_1.EMAIL);
    expect(result).toStrictEqual(ERROR400);
  });

  test('Quiz ID refers to a quiz that has a name that is already used by the target user', () => {
    adminQuizCreate(validToken, VALID_QUIZ_CREATE_INPUTS_1.NAME, 'Another description.');
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
        name: VALID_QUIZ_CREATE_INPUTS_1.NAME,
        questions: expect.any(Array),
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        numQuestions: expect.any(Number),
        description: VALID_QUIZ_CREATE_INPUTS_1.DESCRIPTION,
        duration: expect.any(Number)
      },
    });
  });
});

import {
  adminAuthRegister,
  adminQuizCreate,
  adminQuizTransfer,
  adminQuizInfo,
  clear,
  adminQuizTransferV2,
  adminCreateQuizQuestionV2,
  adminQuizSessionStart
} from '../wrappers';
import {
  VALID_USER_REGISTER_INPUTS_1,
  VALID_USER_REGISTER_INPUTS_2,
  VALID_QUIZ_CREATE_INPUTS_1,
  ERROR400,
  ERROR401,
  ERROR403,
  SUCCESSFUL_TRANSFER,
  validQuestion1V2
} from '../testConstants';

let token: string;
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
    token = registerResponse.jsonBody.token;

    const quizCreateResponse = adminQuizCreate(
      token,
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
    const result = adminQuizTransfer('invalid token', quizId, newOwnerEmail);
    expect(result).toStrictEqual(ERROR401);
  });

  test('Invalid quiz ID', () => {
    const result = adminQuizTransfer(token, quizId + 42, newOwnerEmail);
    expect(result).toStrictEqual(ERROR403);
  });

  test('User email is not a real user', () => {
    const result = adminQuizTransfer(token, quizId, 'fakeuser@unsw.edu.au');
    expect(result).toStrictEqual(ERROR400);
  });

  test('User email is the current logged in user', () => {
    const result = adminQuizTransfer(token, quizId, VALID_USER_REGISTER_INPUTS_1.EMAIL);
    expect(result).toStrictEqual(ERROR400);
  });

  test('Quiz ID refers to a quiz that has a name that is already used by the target user', () => {
    adminQuizCreate(validToken, VALID_QUIZ_CREATE_INPUTS_1.NAME, 'Another description.');
    const result = adminQuizTransfer(token, quizId, newOwnerEmail);
    expect(result).toStrictEqual(ERROR400);
  });

  test('Successful quiz transfer - correct return value', () => {
    const result = adminQuizTransfer(token, quizId, newOwnerEmail);
    expect(result).toStrictEqual(SUCCESSFUL_TRANSFER);
  });

  test('Successful quiz transfer - functionality', () => {
    adminQuizTransfer(token, quizId, newOwnerEmail);
    const updatedQuiz = adminQuizInfo(validToken, quizId);
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

  describe('V2 adminQuizTransfer tests - error cases', () => {
    // should failing ultill adminQuizSessionStart is implemented
    test.skip('Error 400: At least one session has not ended', () => {
      adminCreateQuizQuestionV2(quizId, token, validQuestion1V2);
      adminQuizSessionStart(quizId, token, 5).jsonBody.sessionId; 
      const result = adminQuizTransferV2(token, quizId, newOwnerEmail);
      expect(result).toStrictEqual(ERROR400);
    })
  })
});


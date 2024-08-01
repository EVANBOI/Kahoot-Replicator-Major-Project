import {
  adminAuthRegister,
  adminQuizCreate,
  adminQuizQuestionDuplicate,
  adminQuizInfo,
  adminCreateQuizQuestion,
  clear
} from '../wrappers';
import {
  VALID_USER_REGISTER_INPUTS_1,
  VALID_USER_REGISTER_INPUTS_2,
  VALID_QUIZ_CREATE_INPUTS_1,
  ERROR400,
  ERROR401,
  ERROR403,
  validQuestion1,
  SUCCESSFUL_DUPLICATE
} from '../testConstants';

let sessionId: string;
let quizId: number;
let questionId: number;

beforeEach(() => {
  clear();
});

describe('adminQuizQuestionDuplicate tests', () => {
  beforeEach(() => {
    const registerResponse = adminAuthRegister(VALID_USER_REGISTER_INPUTS_1.EMAIL, VALID_USER_REGISTER_INPUTS_1.PASSWORD, VALID_USER_REGISTER_INPUTS_1.FIRSTNAME, VALID_USER_REGISTER_INPUTS_1.LASTNAME);
    sessionId = registerResponse.jsonBody.token;

    const quizCreateResponse = adminQuizCreate(sessionId, VALID_QUIZ_CREATE_INPUTS_1.NAME, VALID_QUIZ_CREATE_INPUTS_1.DESCRIPTION);
    quizId = quizCreateResponse.jsonBody.quizId;

    const addQuestionResponse = adminCreateQuizQuestion(quizId, sessionId, validQuestion1);
    questionId = addQuestionResponse.jsonBody.questionId;
  });

  test('Invalid session ID', () => {
    const result = adminQuizQuestionDuplicate('invalidSessionId', quizId, questionId);
    expect(result).toStrictEqual(ERROR401);
  });

  test('Invalid quiz ID', () => {
    const result = adminQuizQuestionDuplicate(sessionId, quizId + 42, questionId);
    expect(result).toStrictEqual(ERROR403);
  });

  test('Question ID does not refer to a valid question within this quiz', () => {
    const result = adminQuizQuestionDuplicate(sessionId, quizId, questionId + 42);
    expect(result).toStrictEqual(ERROR400);
  });

  test('User is not the owner of the quiz', () => {
    const newUserRegisterResponse = adminAuthRegister(VALID_USER_REGISTER_INPUTS_2.EMAIL, VALID_USER_REGISTER_INPUTS_2.PASSWORD, VALID_USER_REGISTER_INPUTS_2.FIRSTNAME, VALID_USER_REGISTER_INPUTS_2.LASTNAME);
    const newSessionId = newUserRegisterResponse.jsonBody.token;
    const result = adminQuizQuestionDuplicate(newSessionId, quizId, questionId);
    expect(result).toStrictEqual(ERROR403);
  });

  test('Successful question duplicate - correct return value', () => {
    const result = adminQuizQuestionDuplicate(sessionId, quizId, questionId);
    expect(result).toStrictEqual(SUCCESSFUL_DUPLICATE);
  });

  test('Successful question duplicate - functionality', () => {
    const duplicateResult = adminQuizQuestionDuplicate(sessionId, quizId, questionId);
    const updatedQuiz = adminQuizInfo(sessionId, quizId);
    expect(updatedQuiz).toHaveProperty('jsonBody');
    expect(updatedQuiz.jsonBody.questions).toHaveLength(2);
    expect(updatedQuiz.jsonBody.questions[1]).toMatchObject({
      questionId: duplicateResult.jsonBody.newQuestionId,
      question: validQuestion1.question,
      duration: validQuestion1.duration,
      points: validQuestion1.points,
      answers: validQuestion1.answers
    });
  });
});

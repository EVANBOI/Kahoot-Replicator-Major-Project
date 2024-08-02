import {
  adminAuthRegister,
  adminQuizCreate,
  adminQuizQuestionDuplicate,
  adminQuizQuestionDuplicatV2,
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

// v1 route tests
describe('adminqQuizQuestinoDuplicate tests', () => {
  beforeEach(() => {
    const registerResponse = adminAuthRegister(VALID_USER_REGISTER_INPUTS_1.EMAIL, VALID_USER_REGISTER_INPUTS_1.PASSWORD, VALID_USER_REGISTER_INPUTS_1.FIRSTNAME, VALID_USER_REGISTER_INPUTS_1.LASTNAME);
    sessionId = registerResponse.jsonBody.token;

    const quizCreateResponse = adminQuizCreate(sessionId, VALID_QUIZ_CREATE_INPUTS_1.NAME, VALID_QUIZ_CREATE_INPUTS_1.DESCRIPTION);
    quizId = quizCreateResponse.jsonBody.quizId;

    const addQuestionResponse = adminCreateQuizQuestion(quizId, sessionId, validQuestion1);
    questionId = addQuestionResponse.jsonBody.questionId;
  });
  describe('failure cases', () => {
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
  });

  describe('success cases', () => {
    test('Successful question duplicate - correct return value', () => {
      const result = adminQuizQuestionDuplicate(sessionId, quizId, questionId);
      expect(result).toStrictEqual(SUCCESSFUL_DUPLICATE);
    });
  });
});

// v2 route tests
describe('adminQuizQuestionDuplicateV2 tests', () => {
  beforeEach(() => {
    const registerResponse = adminAuthRegister(VALID_USER_REGISTER_INPUTS_1.EMAIL, VALID_USER_REGISTER_INPUTS_1.PASSWORD, VALID_USER_REGISTER_INPUTS_1.FIRSTNAME, VALID_USER_REGISTER_INPUTS_1.LASTNAME);
    sessionId = registerResponse.jsonBody.token;

    const quizCreateResponse = adminQuizCreate(sessionId, VALID_QUIZ_CREATE_INPUTS_1.NAME, VALID_QUIZ_CREATE_INPUTS_1.DESCRIPTION);
    quizId = quizCreateResponse.jsonBody.quizId;

    const addQuestionResponse = adminCreateQuizQuestion(quizId, sessionId, validQuestion1);
    questionId = addQuestionResponse.jsonBody.questionId;
  });
  describe('failure cases', () => {
    test('Invalid session ID', () => {
      const result = adminQuizQuestionDuplicatV2('invalidSessionId', quizId, questionId);
      expect(result).toStrictEqual(ERROR401);
    });

    test('Invalid quiz ID', () => {
      const result = adminQuizQuestionDuplicatV2(sessionId, quizId + 42, questionId);
      expect(result).toStrictEqual(ERROR403);
    });
    test('User does not own quiz', () => {
      const user2 = adminAuthRegister(
        VALID_USER_REGISTER_INPUTS_2.EMAIL,
        VALID_USER_REGISTER_INPUTS_2.PASSWORD,
        VALID_USER_REGISTER_INPUTS_2.FIRSTNAME,
        VALID_USER_REGISTER_INPUTS_2.LASTNAME);
      const token2 = user2.jsonBody.token;
      const result = adminQuizQuestionDuplicatV2(token2, quizId, questionId);
      expect(result).toStrictEqual(ERROR403);
    });

    test('Question ID does not refer to a valid question within this quiz', () => {
      const result = adminQuizQuestionDuplicatV2(sessionId, quizId, questionId + 42);
      expect(result).toStrictEqual(ERROR400);
    });

    test('User is not the owner of the quiz', () => {
      const newUserRegisterResponse = adminAuthRegister(VALID_USER_REGISTER_INPUTS_2.EMAIL, VALID_USER_REGISTER_INPUTS_2.PASSWORD, VALID_USER_REGISTER_INPUTS_2.FIRSTNAME, VALID_USER_REGISTER_INPUTS_2.LASTNAME);
      const newSessionId = newUserRegisterResponse.jsonBody.token;
      const result = adminQuizQuestionDuplicatV2(newSessionId, quizId, questionId);
      expect(result).toStrictEqual(ERROR403);
    });
  });

  describe('success cases', () => {
    test('Successful question duplicate - correct return value', () => {
      const result = adminQuizQuestionDuplicatV2(sessionId, quizId, questionId);
      expect(result).toStrictEqual(SUCCESSFUL_DUPLICATE);
    });

    test('Successful question duplicate - functionality', () => {
      const duplicateResult = adminQuizQuestionDuplicatV2(sessionId, quizId, questionId);
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
});

import { adminAuthRegister, adminQuizCreate, adminQuizQuestionDuplicate, adminQuizInfo, adminCreateQuizQuestion, clear } from '../wrappers';
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

const SUCCESSFUL_DUPLICATE = {
  statusCode: 200,
  jsonBody: {
    newQuestionId: expect.any(Number),
  },
};

let sessionId: string;
let quizId: number;
let questionId: number;

beforeEach(() => {
  clear();
});

describe('adminQuizQuestionDuplicate tests', () => {
  beforeEach(() => {
    const registerResponse = adminAuthRegister(VALID_INPUTS.EMAIL, VALID_INPUTS.PASSWORD, VALID_INPUTS.FIRSTNAME, VALID_INPUTS.LASTNAME);
    sessionId = registerResponse.jsonBody.token;

    const quizCreateResponse = adminQuizCreate(sessionId, 'My Quiz', 'This is a description.');
    quizId = quizCreateResponse.jsonBody.quizId;

    const addQuestionResponse = adminCreateQuizQuestion(quizId, sessionId, {
      question: 'Sample question',
      duration: 60,
      points: 10,
      answers: [
        { answer: 'Option 1', correct: true },
        { answer: 'Option 2', correct: false }
      ]
    });
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
    const newUserRegisterResponse = adminAuthRegister('newuser@unsw.edu.au', 'Password123', 'New', 'User');
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
    const updatedQuiz = ok(adminQuizInfo(sessionId, quizId));
    expect(updatedQuiz).toHaveProperty('jsonBody');
    expect(updatedQuiz.jsonBody.questions).toHaveLength(2);
    expect(updatedQuiz.jsonBody.questions[1]).toMatchObject({
      questionId: duplicateResult.jsonBody.newQuestionId,
      question: 'Sample question',
      duration: 60,
      points: 10,
      answers: [
        { answer: 'Option 1', correct: true },
        { answer: 'Option 2', correct: false }
      ]
    });
  });
});

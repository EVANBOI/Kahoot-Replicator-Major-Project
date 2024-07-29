import { adminQuizQuestionDelete, adminAuthRegister, clear, adminQuizInfo } from '../wrappers';
import { TokenObject, QuizIdObject, QuestionBody } from '../types';
import { adminQuizCreate } from '../quiz';
import { adminCreateQuizQuestion } from '../question';

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
let validQuestionId: number;

const questionBody: QuestionBody = {
  question: 'Who is the Monarch of England?',
  duration: 4,
  points: 5,
  answers: [
    { answer: 'Prince Charles', correct: true },
    { answer: 'Prince William', correct: false }
  ]
};

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

  validQuestionId = (adminCreateQuizQuestion(validQuizId, sessionId, questionBody) as { questionId: number }).questionId;
});

describe('Success cases', () => {
  test('should successfully delete a quiz question', () => {
    const result = adminQuizQuestionDelete(sessionId, validQuizId, validQuestionId);
    expect(result).toEqual({
      statusCode: 200,
      jsonBody: {}
    });

    // Verify the question is actually removed
    const quizInfo = adminQuizInfo(sessionId, validQuizId);
    expect(quizInfo.jsonBody?.questions).not.toContainEqual(
      expect.objectContaining({ questionId: validQuestionId })
    );
  });
});

describe('Failure cases', () => {
  test('should return an error when deleting a question with an invalid sessionId', () => {
    const result = adminQuizQuestionDelete(sessionId + 'invalid', validQuizId, validQuestionId);
    expect(result).toStrictEqual({
      statusCode: 401,
      jsonBody: {
        error: expect.any(String),
      },
    });
  });

  test('should return an error when deleting a question with an invalid questionId', (): void => {
    const result = adminQuizQuestionDelete(sessionId, validQuizId, validQuestionId + 1029);
    expect(result).toStrictEqual({
      statusCode: 400,
      jsonBody: {
        error: expect.any(String),
      },
    });
  });

  test('should return an error when deleting a question from a quiz that the user does not own', (): void => {
    const result = adminQuizQuestionDelete(sessionId, validQuizId2, validQuestionId);
    expect(result).toStrictEqual({
      statusCode: 403,
      jsonBody: {
        error: expect.any(String),
      },
    });
  });
});

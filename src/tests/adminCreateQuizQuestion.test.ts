import { QuestionBody } from '../types';
import {
  adminCreateQuizQuestion,
  adminQuizCreate,
  adminAuthRegister,
  clear
} from '../wrappers';

const SUCCESSFUL = {
  statusCode: 200,
  jsonBody: { questionId: expect.any(Number) }
};

const ERROR_BODY = { error: expect.any(String) };

const validQuestion1: QuestionBody = {
  question: 'Valid question 1?',
  duration: 3,
  points: 2,
  answers: [
    { answer: 'A', correct: true },
    { answer: 'B', correct: false }
  ]
};

const validQuestion2: QuestionBody = {
  question: 'Valid question 2?',
  duration: 150,
  points: 2,
  answers: [
    { answer: 'Amb', correct: false },
    { answer: 'Bsgd', correct: true }
  ]
};

let sessionId1: string, sessionId2: string;
let quizId1: number;
beforeEach(() => {
  clear();
  const { jsonBody: body1 } = adminAuthRegister(
    'admin1@ad.unsw.edu.au',
    'Password',
    'First',
    'Last');
  sessionId1 = body1?.sessionId;
  const { jsonBody: body2 } = adminAuthRegister(
    'adminw@ad.unsw.edu.au',
    'Password',
    'First',
    'Last');
  sessionId2 = body2?.sessionId;
  const { jsonBody: body3 } = adminQuizCreate(sessionId1, 'Quiz 1', 'Description');
  quizId1 = body3?.quizId;
});

describe('Unsuccesful Tests', () => {
  // should I have some tests for cases where there are no users?
  describe('Expected error code is 400', () => {
    test.each([
        {
            testName: 'Question string is less than 5 characters',
            quizId: quizId1,
            sessionId: sessionId1,
            questionBody: {
                question: 'Va?',
                duration: 3,
                points: 2,
                answers: [
                  { answer: 'Amb', correct: false },
                  { answer: 'Bsgd', correct: true }
                ]
            }
        },
        {
            testName: 'Question string is more than 50 characters',
            quizId: quizId1,
            sessionId: sessionId1,
            questionBody: {
                question: 'V'.repeat(60),
                duration: 3,
                points: 2,
                answers: [
                  { answer: 'Amb', correct: false },
                  { answer: 'Bsgd', correct: true }
                ]
            }
        },
        {
            testName: 'The question has more than 6 answers',
            quizId: quizId1,
            sessionId: sessionId1,
            questionBody: {
                question: 'Question?',
                duration: 3,
                points: 2,
                answers: [
                  { answer: 'A', correct: false },
                  { answer: 'B', correct: true },
                  { answer: 'C', correct: false },
                  { answer: 'D', correct: true },
                  { answer: 'E', correct: false },
                  { answer: 'F', correct: true },
                  { answer: 'G', correct: false },
                  { answer: 'H', correct: true }
                ]
            }
        },
        {
            testName: 'The question has less than 2 answers',
            quizId: quizId1,
            sessionId: sessionId1,
            questionBody: {
                question: 'Question?',
                duration: 3,
                points: 2,
                answers: [
                  { answer: 'A', correct: false }
                ]
            }
        },
        {
            testName: 'The quiz has no correct answers',
            quizId: quizId1,
            sessionId: sessionId1,
            questionBody: {
                question: 'Question?',
                duration: 3,
                points: 2,
                answers: [
                  { answer: 'A', correct: false },
                  { answer: 'B', correct: false }
                ]
            }
        },
        {
            testName: 'Question duration is not a positive number',
            quizId: quizId1,
            sessionId: sessionId1,
            questionBody: {
                question: 'Question?',
                duration: -1,
                points: 2,
                answers: [
                  { answer: 'A', correct: false },
                  { answer: 'B', correct: true }
                ]
            }
        },
        {
            testName: 'Question duration exceeds 3 minutes',
            quizId: quizId1,
            sessionId: sessionId1,
            questionBody: {
                question: 'Question?',
                duration: 300,
                points: 2,
                answers: [
                  { answer: 'A', correct: false },
                  { answer: 'B', correct: true }
                ]
            }
        },
        {
            testName: 'Points awarded for the question is less than 0',
            quizId: quizId1,
            sessionId: sessionId1,
            questionBody: {
                question: 'Question?',
                duration: 3,
                points: -1,
                answers: [
                  { answer: 'A', correct: false },
                  { answer: 'B', correct: true }
                ]
            }
        },
        {
            testName: 'Points awarded frot the question is more than 10',
            quizId: quizId1,
            sessionId: sessionId1,
            questionBody: {
                question: 'Question?',
                duration: 3,
                points: 20,
                answers: [
                  { answer: 'A', correct: false },
                  { answer: 'B', correct: true }
                ]
            }
        },
        {
            testName: 'Length of answer string is less than 1 characters',
            quizId: quizId1,
            sessionId: sessionId1,
            questionBody: {
                question: 'Question?',
                duration: 3,
                points: 2,
                answers: [
                  { answer: '', correct: false },
                  { answer: 'B', correct: true }
                ]
            }
        },
        {
            testName: 'Length of answer string is more than 30 characters',
            quizId: quizId1,
            sessionId: sessionId1,
            questionBody: {
                question: 'Question?',
                duration: 3,
                points: 2,
                answers: [
                  { answer: 'A'.repeat(50), correct: false },
                  { answer: 'B', correct: true }
                ]
            }
        },
        {
            testName: 'There are duplicate answer strings (in same question)',
            quizId: quizId1,
            sessionId: sessionId1,
            questionBody: {
                question: 'Question?',
                duration: 3,
                points: 2,
                answers: [
                  { answer: 'A', correct: false },
                  { answer: 'A', correct: true }
                ]
            }
        },
        {
            testName: 'There are duplicate answer strings (in same question)',
            quizId: quizId1,
            sessionId: sessionId1,
            questionBody: {
                question: 'Question?',
                duration: 3,
                points: 2,
                answers: [
                  { answer: 'A', correct: false },
                  { answer: 'A', correct: true }
                ]
            }
        },
    ])('$testName', ({ quizId, sessionId, questionBody }) => {
        const result = adminCreateQuizQuestion(quizId, sessionId, questionBody);
        expect(result.statusCode).toStrictEqual(400);
        expect(result.jsonBody).toStrictEqual(ERROR_BODY);
    })

    test('Total quiz duration exceeds 3 minutes with multiple questions', () => {
        // Duration of validQuestion 2 is 150 seconds, 
        // creating it twice will cause total quiz duration to go over 3 min.
        adminCreateQuizQuestion(quizId1, sessionId1, validQuestion2);
        const result = adminCreateQuizQuestion(quizId1, sessionId1, validQuestion2);
        expect(result.statusCode).toStrictEqual(400);
        expect(result.jsonBody).toStrictEqual(ERROR_BODY);
    });
  });

  describe('Expected error code is 401', () => {
    test('Empty sessionId', () => {
      const result = adminCreateQuizQuestion(quizId1, '', validQuestion1);
      expect(result.statusCode).toStrictEqual(401);
      expect(result.jsonBody).toStrictEqual(ERROR_BODY);
    });
    test('Invalid sessionId', () => {
        const result = adminCreateQuizQuestion(quizId1, '-00000', validQuestion1);
        expect(result.statusCode).toStrictEqual(401);
        expect(result.jsonBody).toStrictEqual(ERROR_BODY);
    });
  });
  describe('Expected error code is 403', () => {
    test('User is not an owner of quiz', () => {
        const result = adminCreateQuizQuestion(quizId1, sessionId2, validQuestion1);
        expect(result.statusCode).toStrictEqual(403);
        expect(result.jsonBody).toStrictEqual(ERROR_BODY);
    });
    test('Quiz does not exist', () => {
        const result = adminCreateQuizQuestion(quizId1 - 911, sessionId1, validQuestion1);
        expect(result.statusCode).toStrictEqual(403);
        expect(result.jsonBody).toStrictEqual(ERROR_BODY);
    });
  });
});

describe('Succesful Tests', () => {
  test('Check return type', () => {
    const result = adminCreateQuizQuestion(quizId1 - 911, sessionId1, validQuestion1);
    expect(result).toStrictEqual(SUCCESSFUL);
  });
  test.todo('Successfully make one valid question');
  test.todo('Successfully make multiple valid questions');
  test.todo('Check that questionId returned is unique in that quiz');
  test.todo('Make questions for multiple quizzes by the same owner');
  test.todo('Make questions for multiple quizzes by different owners');
});

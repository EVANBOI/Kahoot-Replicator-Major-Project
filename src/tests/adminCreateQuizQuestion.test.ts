import { QuestionBody } from '../types';
import {
  adminCreateQuizQuestion,
  adminQuizCreate,
  adminAuthRegister,
  adminQuizInfo,
  clear
} from '../wrappers';
import { ok } from '../helpers'
import exp from 'constants';
import { adminQuizList } from '../quiz';

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

const validQuestion3: QuestionBody = {
    question: 'Valid question 3?',
    duration: 5,
    points: 2,
    answers: [
      { answer: 'Amb', correct: false },
      { answer: 'Bsgd', correct: true },
      { answer: 'Clsj', correct: false }
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
    const result = adminCreateQuizQuestion(quizId1, sessionId1, validQuestion1);
    expect(result).toStrictEqual(SUCCESSFUL);
  });
  test('Successfully make one valid question', () => {
    adminCreateQuizQuestion(quizId1, sessionId1, validQuestion1);
    const result = adminQuizInfo(sessionId1, quizId1);
    expect(result.jsonBody).toStrictEqual({
        quizId: quizId1,
        name: 'Quiz 1',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Description',
        questions: [validQuestion1]
    })
  });
  test('Check that description time was updated successfully', () => {
    adminCreateQuizQuestion(quizId1, sessionId1, validQuestion1);
    const result = adminQuizInfo(sessionId1, quizId1).jsonBody; 
  })

  test('Successfully make multiple valid questions', () => {
    adminCreateQuizQuestion(quizId1, sessionId1, validQuestion1);
    adminCreateQuizQuestion(quizId1, sessionId1, validQuestion2);
    adminCreateQuizQuestion(quizId1, sessionId1, validQuestion3);
    const result = adminQuizInfo(sessionId1, quizId1);
    expect(result.jsonBody).toStrictEqual({
        quizId: quizId1,
        name: 'Quiz 1',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Description',
        questions: [validQuestion1, validQuestion2, validQuestion3]
    })
  });
  test('Check that questionId returned is unique in that quiz', () => {
    const id1 = adminCreateQuizQuestion(quizId1, sessionId1, validQuestion1);
    const id2 = adminCreateQuizQuestion(quizId1, sessionId1, validQuestion2);
    expect(id1).not.toStrictEqual(id2);
  });
  test('Make questions for multiple quizzes by the same owner', () => {
    const { jsonBody: quiz } = adminQuizCreate(
        sessionId1, 
        'Quiz 2', 
        'Description of other quiz');
    const quizId2 = quiz?.quizId;
    adminCreateQuizQuestion(quizId1, sessionId1, validQuestion1);
    adminCreateQuizQuestion(quizId1, sessionId1, validQuestion2);
    adminCreateQuizQuestion(quizId2, sessionId1, validQuestion3);
    const result1 = adminQuizInfo(sessionId1, quizId1);
    expect(result1).toStrictEqual({
        quizId: quizId1,
        name: 'Quiz 1',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Description',
        questions: [validQuestion1, validQuestion2]
    })
    const result2 = adminQuizInfo(sessionId1, quizId2);
    expect(result2).toStrictEqual({
        quizId: quizId2,
        name: 'Quiz 2',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Description of other quiz',
        questions: [validQuestion3]
    })
  });
  test('Make questions for multiple quizzes by different owners', () => {
    const { jsonBody: quiz } = adminQuizCreate(
        sessionId2, 
        'Quiz 2', 
        'Description of other quiz');
    const quizId2 = quiz?.quizId;
    adminCreateQuizQuestion(quizId1, sessionId1, validQuestion1);
    adminCreateQuizQuestion(quizId1, sessionId1, validQuestion2);
    adminCreateQuizQuestion(quizId2, sessionId2, validQuestion3);
    const result1 = adminQuizInfo(sessionId1, quizId1);
    expect(result1).toStrictEqual({
        quizId: quizId1,
        name: 'Quiz 1',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Description',
        questions: [validQuestion1, validQuestion2]
    })
    const result2 = adminQuizInfo(sessionId2, quizId2);
    expect(result2).toStrictEqual({
        quizId: quizId2,
        name: 'Quiz 2',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Description of other quiz',
        questions: [validQuestion3]
    })
  });
});

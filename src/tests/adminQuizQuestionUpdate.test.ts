import {
  validQuestion1,
  ERROR401,
  ERROR403,
  ERROR400,
  validQuestion2,
  validQuestion3
} from '../testConstants';
import {
  adminCreateQuizQuestion,
  clear,
  adminAuthRegister,
  adminQuizCreate,
  adminQuizQuestionUpdate,
  adminQuizInfo
} from '../wrappers';

const UPDATED = {
  statusCode: 200,
  jsonBody: { }
};

beforeEach(() => {
  clear();
});

let sessionId1: string, sessionId2: string;
let quizId1: number;
let questionId1: number;

beforeEach(() => {
  const { jsonBody: body1 } = adminAuthRegister(
    'admin1@ad.unsw.edu.au',
    'Passwor234d',
    'First',
    'Last');
  sessionId1 = body1?.token;

  const { jsonBody: body2 } = adminAuthRegister(
    'admin2@ad.unsw.edu.au',
    'Passw34ord',
    'First',
    'Last');
  sessionId2 = body2?.token;

  const { jsonBody: body3 } = adminQuizCreate(
    sessionId1,
    'Quiz 1',
    'Description');
  quizId1 = body3?.quizId;

  const { jsonBody: body4 } = adminCreateQuizQuestion(
    quizId1,
    sessionId1,
    validQuestion1);
  questionId1 = body4?.questionId;
});

describe('Unsuccessful Updates: 401 errors', () => {
  test('Token is invalid', () => {
    expect(adminQuizQuestionUpdate(
      quizId1,
      questionId1,
      validQuestion1,
      sessionId1 + 1)).toStrictEqual(ERROR401);
  });

  test('Token is empty', () => {
    expect(adminQuizQuestionUpdate(
      quizId1,
      questionId1,
      validQuestion1,
      ' ')).toStrictEqual(ERROR401);
  });
});

describe('Unsuccessful Updates: 403 errors', () => {
  test('User is not an owner of the quiz', () => {
    expect(adminQuizQuestionUpdate(
      quizId1,
      questionId1,
      validQuestion1,
      sessionId2)).toStrictEqual(ERROR403);
  });

  test('Quiz does not exist', () => {
    expect(adminQuizQuestionUpdate(
      quizId1 + 1,
      questionId1,
      validQuestion1,
      sessionId1)).toStrictEqual(ERROR403);
  });
});

describe('Unsuccessful Updates: 400 errors', () => {
  test('Question Id is not valid', () => {
    expect(adminQuizQuestionUpdate(
      quizId1,
      questionId1 + 1,
      validQuestion1,
      sessionId1)).toStrictEqual(ERROR400);
  });

  test('Question string is less than 5 characters', () => {
    const result = adminQuizQuestionUpdate(
      quizId1,
      questionId1,
      {
        question: 'Vv?',
        duration: 3,
        points: 2,
        answers: [
          { answer: 'Amb', correct: false },
          { answer: 'Bsgd', correct: true }
        ]
      },
      sessionId1);
    expect(result).toStrictEqual(ERROR400);
  });

  test('Question is greater than 50 characters', () => {
    const result = adminQuizQuestionUpdate(
      quizId1,
      questionId1,
      {
        question: 'a'.repeat(70),
        duration: 3,
        points: 2,
        answers: [
          { answer: 'Amb', correct: false },
          { answer: 'Bsgd', correct: true }
        ]
      },
      sessionId1);
    expect(result).toStrictEqual(ERROR400);
  });

  test('Question has more than 6 answers', () => {
    const result = adminQuizQuestionUpdate(
      quizId1,
      questionId1,
      {
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
      },
      sessionId1);
    expect(result).toStrictEqual(ERROR400);
  });

  test('Question has less than 2 answers', () => {
    const result = adminQuizQuestionUpdate(
      quizId1,
      questionId1,
      {
        question: 'Question?',
        duration: 3,
        points: 2,
        answers: [
          { answer: 'A', correct: true },
        ]
      },
      sessionId1);
    expect(result).toStrictEqual(ERROR400);
  });

  test('Question duration is not positive', () => {
    const result = adminQuizQuestionUpdate(
      quizId1,
      questionId1,
      {
        question: 'Question?',
        duration: -5,
        points: 2,
        answers: [
          { answer: 'Amb', correct: false },
          { answer: 'Bsgd', correct: true }
        ]
      },
      sessionId1);
    expect(result).toStrictEqual(ERROR400);
  });

  test('Question duration exceeds 3 minutes', () => {
    const result = adminQuizQuestionUpdate(
      quizId1,
      questionId1,
      {
        question: 'Question?',
        duration: 4000,
        points: 2,
        answers: [
          { answer: 'Amb', correct: false },
          { answer: 'Bsgd', correct: true }
        ]
      },
      sessionId1);
    expect(result).toStrictEqual(ERROR400);
  });

  test('Points awarded for the question is less than 1', () => {
    const result = adminQuizQuestionUpdate(
      quizId1,
      questionId1,
      {
        question: 'Question?',
        duration: 3,
        points: -1,
        answers: [
          { answer: 'Amb', correct: false },
          { answer: 'Bsgd', correct: true }
        ]
      },
      sessionId1);
    expect(result).toStrictEqual(ERROR400);
  });

  test('Points awarded for the question is greater than 10', () => {
    const result = adminQuizQuestionUpdate(
      quizId1,
      questionId1,
      {
        question: 'Question?',
        duration: 3,
        points: 20,
        answers: [
          { answer: 'Amb', correct: false },
          { answer: 'Bsgd', correct: true }
        ]
      },
      sessionId1);
    expect(result).toStrictEqual(ERROR400);
  });

  test('Length of the answer is shorter than 1 character', () => {
    const result = adminQuizQuestionUpdate(
      quizId1,
      questionId1,
      {
        question: 'Question?',
        duration: 3,
        points: 20,
        answers: [
          { answer: '', correct: false },
          { answer: 'Bsgd', correct: true }
        ]
      },
      sessionId1);
    expect(result).toStrictEqual(ERROR400);
  });

  test('Length of the answer is greater than 30 characters', () => {
    const result = adminQuizQuestionUpdate(
      quizId1,
      questionId1,
      {
        question: 'Question?',
        duration: 3,
        points: 20,
        answers: [
          { answer: 'A'.repeat(50), correct: false },
          { answer: 'Bsgd', correct: true }
        ]
      },
      sessionId1);
    expect(result).toStrictEqual(ERROR400);
  });

  test('The questions has duplicate answers', () => {
    const result = adminQuizQuestionUpdate(
      quizId1,
      questionId1,
      {
        question: 'Question?',
        duration: 3,
        points: 5,
        answers: [
          { answer: 'Amb', correct: false },
          { answer: 'Amb', correct: false }
        ]
      },
      sessionId1);
    expect(result).toStrictEqual(ERROR400);
  });

  test('The question has no correct answers', () => {
    const result = adminQuizQuestionUpdate(
      quizId1,
      questionId1,
      {
        question: 'Question?',
        duration: 3,
        points: 5,
        answers: [
          { answer: 'Amb', correct: false },
          { answer: 'Bsgd', correct: false }
        ]
      },
      sessionId1);
    expect(result).toStrictEqual(ERROR400);
  });
});

describe('Successful Updates', () => {
  test('Returns Correct Type', () => {
    const result = adminQuizQuestionUpdate(
      quizId1,
      questionId1,
      validQuestion1,
      sessionId1);
    expect(result).toStrictEqual(UPDATED);
  });

  test('Successfully Update a Question', () => {
    adminQuizQuestionUpdate(quizId1, questionId1, validQuestion1, sessionId1);
    const result = adminQuizInfo(sessionId1, quizId1);
    expect(result.jsonBody).toStrictEqual({
      quizId: quizId1,
      duration: expect.any(Number),
      name: 'Quiz 1',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Description',
      questions: [validQuestion1]
    });
  });

  test('Successfully updated the timeLastEdited key', () => {
    const startTime = Math.floor(Date.now() / 1000);
    adminQuizQuestionUpdate(quizId1, questionId1, validQuestion1, sessionId1);
    const result = adminQuizInfo(sessionId1, quizId1);

    // Checking that the timestamps are within a 1 second range.
    const endTime = Math.floor(Date.now() / 1000);
    expect(result.jsonBody?.timeLastEdited).toBeGreaterThanOrEqual(startTime);
    expect(result.jsonBody?.timeLastEdited).toBeLessThanOrEqual(endTime);
  });

  test('Successfully update the same question multiple times', () => {
    adminQuizQuestionUpdate(
      quizId1,
      questionId1,
      validQuestion1,
      sessionId1);
    const result = adminQuizQuestionUpdate(
      quizId1,
      questionId1,
      validQuestion2,
      sessionId1);

    expect(result).toStrictEqual(UPDATED);
    const quizInfo = adminQuizInfo(sessionId1, quizId1);
    expect(quizInfo.jsonBody).toStrictEqual({
      quizId: quizId1,
      duration: expect.any(Number),
      name: 'Quiz 1',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Description',
      questions: [validQuestion2]
    });
  });

  test('Successfully update two different questions', () => {
    const result1 = adminQuizQuestionUpdate(
      quizId1,
      questionId1,
      validQuestion2,
      sessionId1);
    expect(result1).toStrictEqual(UPDATED);

    const { jsonBody: body5 } = adminCreateQuizQuestion(
      quizId1,
      sessionId1,
      validQuestion1);
    const questionId2 = body5?.questionId;

    const result2 = adminQuizQuestionUpdate(quizId1, questionId2, validQuestion3, sessionId1);
    expect(result2).toStrictEqual(UPDATED);

    const quizInfo = adminQuizInfo(sessionId1, quizId1);
    expect(quizInfo.jsonBody).toStrictEqual({
      quizId: quizId1,
      duration: expect.any(Number),
      name: 'Quiz 1',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Description',
      questions: [validQuestion2, validQuestion3]
    });
  });
});

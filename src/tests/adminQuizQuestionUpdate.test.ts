import { Colours } from '../helpers';
import {
  validQuestion1V2,
  ERROR401,
  ERROR403,
  ERROR400,
  validQuestion2V2,
  validQuestion3V2,
  validQuestion1
} from '../testConstants';
import {
  adminCreateQuizQuestionV2,
  clear,
  adminAuthRegister,
  adminQuizCreateV2,
  adminQuizQuestionUpdate,
  adminQuizQuestionUpdateV2,
  adminQuizInfoV2,
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

  const { jsonBody: body3 } = adminQuizCreateV2(
    sessionId1,
    'Quiz 1',
    'Description');
  quizId1 = body3?.quizId;

  const { jsonBody: body4 } = adminCreateQuizQuestionV2(
    quizId1,
    sessionId1,
    validQuestion1V2);
  questionId1 = body4?.questionId;
});

// v1 route tests
describe('Error cases for v1', () => {
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
  });

  describe('Unsuccessful Updates: 400 errors', () => {
    test('Question Id is not valid', () => {
      expect(adminQuizQuestionUpdate(
        quizId1,
        questionId1 + 1,
        validQuestion1,
        sessionId1)).toStrictEqual(ERROR400);
    });
  });
});

describe('Successful Updates for v1', () => {
  test('Returns Correct Type', () => {
    const result = adminQuizQuestionUpdate(
      quizId1,
      questionId1,
      validQuestion1,
      sessionId1);
    expect(result).toStrictEqual(UPDATED);
  });
});

// v2 route tests
describe('Unsuccessful Updates for v2: 401 errors', () => {
  test('Token is invalid', () => {
    expect(adminQuizQuestionUpdateV2(
      quizId1,
      questionId1,
      validQuestion1V2,
      sessionId1 + 1)).toStrictEqual(ERROR401);
  });

  test('Token is empty', () => {
    expect(adminQuizQuestionUpdateV2(
      quizId1,
      questionId1,
      validQuestion1V2,
      ' ')).toStrictEqual(ERROR401);
  });
});

describe('Unsuccessful Update for v2: 403 errors', () => {
  test('User is not an owner of the quiz', () => {
    expect(adminQuizQuestionUpdateV2(
      quizId1,
      questionId1,
      validQuestion1V2,
      sessionId2)).toStrictEqual(ERROR403);
  });

  test('Quiz does not exist', () => {
    expect(adminQuizQuestionUpdateV2(
      quizId1 + 1,
      questionId1,
      validQuestion1V2,
      sessionId1)).toStrictEqual(ERROR403);
  });
});

describe('Unsuccessful Updates for v2: 400 errors', () => {
  test('Question Id is not valid', () => {
    expect(adminQuizQuestionUpdateV2(
      quizId1,
      questionId1 + 1,
      validQuestion1V2,
      sessionId1)).toStrictEqual(ERROR400);
  });

  test('Question string is less than 5 characters', () => {
    const result = adminQuizQuestionUpdateV2(
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
    const result = adminQuizQuestionUpdateV2(
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
    const result = adminQuizQuestionUpdateV2(
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
    const result = adminQuizQuestionUpdateV2(
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
    const result = adminQuizQuestionUpdateV2(
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
    const result = adminQuizQuestionUpdateV2(
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
    const result = adminQuizQuestionUpdateV2(
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
    const result = adminQuizQuestionUpdateV2(
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
    const result = adminQuizQuestionUpdateV2(
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
    const result = adminQuizQuestionUpdateV2(
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
    const result = adminQuizQuestionUpdateV2(
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
    const result = adminQuizQuestionUpdateV2(
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

  test('url is an empty string', () => {
    const result = adminQuizQuestionUpdateV2(
      quizId1,
      questionId1,
      {
        questionId: expect.any(Number),
        question: 'Valid question 1?',
        duration: 3,
        points: 2,
        answers: [
          {
            answerId: expect.any(Number),
            colour: expect.any(String),
            answer: 'A',
            correct: true
          },
          {
            answerId: expect.any(Number),
            colour: expect.any(String),
            answer: 'B',
            correct: false
          }
        ],
        thumbnailUrl: ''
      },
      sessionId1
    );
    expect(result).toStrictEqual(ERROR400);
  });

  test('url is invalid file type', () => {
    const result = adminQuizQuestionUpdateV2(
      quizId1,
      questionId1,
      {
        questionId: expect.any(Number),
        question: 'Valid question 1?',
        duration: 3,
        points: 2,
        answers: [
          {
            answerId: expect.any(Number),
            colour: expect.any(String),
            answer: 'A',
            correct: true
          },
          {
            answerId: expect.any(Number),
            colour: expect.any(String),
            answer: 'B',
            correct: false
          }
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpe'
      },
      sessionId1
    );
    expect(result).toStrictEqual(ERROR400);
  });

  test('url does not begin with http or https', () => {
    const result = adminQuizQuestionUpdateV2(
      quizId1,
      questionId1,
      {
        questionId: expect.any(Number),
        question: 'Valid question 1?',
        duration: 3,
        points: 2,
        answers: [
          {
            answerId: expect.any(Number),
            colour: expect.any(String),
            answer: 'A',
            correct: true
          },
          {
            answerId: expect.any(Number),
            colour: expect.any(String),
            answer: 'B',
            correct: false
          }
        ],
        thumbnailUrl: 'htteep://google.com/some/image/path.jpg'
      },
      sessionId1
    );
    expect(result).toStrictEqual(ERROR400);
  });
});

describe('Successful Updates for v2', () => {
  test('Returns Correct Type', () => {
    const result = adminQuizQuestionUpdateV2(
      quizId1,
      questionId1,
      validQuestion1V2,
      sessionId1);
    expect(result).toStrictEqual(UPDATED);
  });

  test('Successfully Update a Question', () => {
    adminQuizQuestionUpdateV2(quizId1, questionId1, validQuestion1V2, sessionId1);
    const result = adminQuizInfoV2(sessionId1, quizId1);
    expect(result.jsonBody).toStrictEqual({
      quizId: quizId1,
      duration: expect.any(Number),
      name: 'Quiz 1',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Description',
      numQuestions: expect.any(Number),
      questions: [validQuestion1V2]
    });
  });

  test('Check updated question has correct answers', () => {
    adminCreateQuizQuestionV2(quizId1, sessionId1, validQuestion1V2);
    const quiz = adminQuizInfoV2(sessionId1, quizId1).jsonBody;
    const colours = Object.values(Colours);
    for (const answer of quiz.questions[0].answers) {
      expect(colours).toContain(answer.colour);
      expect(answer.answerId).toEqual(expect.any(Number));
      expect(['A', 'B']).toContain(answer.answer);
    }
  });

  test('Successfully updated the timeLastEdited key', () => {
    const startTime = Math.floor(Date.now() / 1000);
    adminQuizQuestionUpdateV2(quizId1, questionId1, validQuestion1V2, sessionId1);
    const result = adminQuizInfoV2(sessionId1, quizId1);

    // Checking that the timestamps are within a 1 second range.
    const endTime = Math.floor(Date.now() / 1000);
    expect(result.jsonBody?.timeLastEdited).toBeGreaterThanOrEqual(startTime);
    expect(result.jsonBody?.timeLastEdited).toBeLessThanOrEqual(endTime);
  });

  test('Successfully update the same question multiple times', () => {
    adminQuizQuestionUpdateV2(
      quizId1,
      questionId1,
      validQuestion1V2,
      sessionId1);
    const result = adminQuizQuestionUpdateV2(
      quizId1,
      questionId1,
      validQuestion2V2,
      sessionId1);

    expect(result).toStrictEqual(UPDATED);
    const quizInfo = adminQuizInfoV2(sessionId1, quizId1);
    expect(quizInfo.jsonBody).toStrictEqual({
      quizId: quizId1,
      duration: expect.any(Number),
      name: 'Quiz 1',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Description',
      numQuestions: expect.any(Number),
      questions: [validQuestion2V2]
    });
  });

  test('Successfully update two different questions', () => {
    const result1 = adminQuizQuestionUpdateV2(
      quizId1,
      questionId1,
      validQuestion2V2,
      sessionId1);
    expect(result1).toStrictEqual(UPDATED);

    const { jsonBody: body5 } = adminCreateQuizQuestionV2(
      quizId1,
      sessionId1,
      validQuestion1V2);
    const questionId2 = body5?.questionId;

    const result2 = adminQuizQuestionUpdateV2(quizId1, questionId2, validQuestion3V2, sessionId1);
    expect(result2).toStrictEqual(UPDATED);

    const quizInfo = adminQuizInfoV2(sessionId1, quizId1);
    expect(quizInfo.jsonBody).toStrictEqual({
      quizId: quizId1,
      duration: expect.any(Number),
      name: 'Quiz 1',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Description',
      numQuestions: expect.any(Number),
      questions: [validQuestion2V2, validQuestion3V2]
    });
  });
});

import {
  validQuestion1,
  validQuestion2,
  validQuestion3,
  ERROR400,
  ERROR401,
  ERROR403,
  validQuestion1V2
} from '../testConstants';
import {
  adminCreateQuizQuestion,
  adminQuizCreate,
  adminAuthRegister,
  adminQuizInfo,
  clear,
  adminQuizQuestionDelete,
  adminCreateQuizQuestionV2
} from '../wrappers';

const SUCCESSFUL = {
  statusCode: 200,
  jsonBody: { questionId: expect.any(Number) }
};

let sessionId1: string, sessionId2: string;
let quizId1: number;
beforeEach(() => {
  clear();
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
  const { jsonBody: body3 } = adminQuizCreate(sessionId1, 'Quiz 1', 'Description');
  quizId1 = body3?.quizId;
});

describe('Unsuccesful Tests', () => {
  describe('Expected error code is 401', () => {
    test('Empty sessionId', () => {
      const result = adminCreateQuizQuestion(quizId1, '', validQuestion1);
      expect(result).toStrictEqual(ERROR401);
    });
    test('Invalid sessionId', () => {
      const result = adminCreateQuizQuestion(quizId1, '-00000', validQuestion1);
      expect(result).toStrictEqual(ERROR401);
    });
  });
  describe('Expected error code is 403', () => {
    test('User is not an owner of quiz', () => {
      const result = adminCreateQuizQuestion(quizId1, sessionId2, validQuestion1);
      expect(result).toStrictEqual(ERROR403);
    });
    test('Quiz does not exist', () => {
      const result = adminCreateQuizQuestion(quizId1 - 911, sessionId1, validQuestion1);
      expect(result).toStrictEqual(ERROR403);
    });
  });

  describe('Expected error code is 400', () => {
    test('Question string is less than 5 characters', () => {
      const result = adminCreateQuizQuestion(quizId1, sessionId1, {
        question: 'Va?',
        duration: 3,
        points: 2,
        answers: [
          { answer: 'Amb', correct: false },
          { answer: 'Bsgd', correct: true }
        ]
      });
      expect(result).toStrictEqual(ERROR400);
    });

    test('Question string is more than 50 characters', () => {
      const result = adminCreateQuizQuestion(quizId1, sessionId1, {
        question: 'V'.repeat(60),
        duration: 3,
        points: 2,
        answers: [
          { answer: 'Amb', correct: false },
          { answer: 'Bsgd', correct: true }
        ]
      });
      expect(result).toStrictEqual(ERROR400);
    });

    test('The question has more than 6 answers', () => {
      const result = adminCreateQuizQuestion(quizId1, sessionId1, {
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
      });
      expect(result).toStrictEqual(ERROR400);
    });

    test('The question has less than 2 answers', () => {
      const result = adminCreateQuizQuestion(quizId1, sessionId1, {
        question: 'Question?',
        duration: 3,
        points: 2,
        answers: [
          { answer: 'A', correct: false }
        ]
      });
      expect(result).toStrictEqual(ERROR400);
    });

    test('The quiz has no correct answers', () => {
      const result = adminCreateQuizQuestion(quizId1, sessionId1, {
        question: 'Question?',
        duration: 3,
        points: 2,
        answers: [
          { answer: 'A', correct: false },
          { answer: 'B', correct: false }
        ]
      });
      expect(result).toStrictEqual(ERROR400);
    });

    test('Question duration is not a positive number', () => {
      const result = adminCreateQuizQuestion(quizId1, sessionId1, {
        question: 'Question?',
        duration: -1,
        points: 2,
        answers: [
          { answer: 'A', correct: false },
          { answer: 'B', correct: true }
        ]
      });
      expect(result).toStrictEqual(ERROR400);
    });

    test('Question duration exceeds 3 minutes', () => {
      const result = adminCreateQuizQuestion(quizId1, sessionId1, {
        question: 'Question?',
        duration: 300,
        points: 2,
        answers: [
          { answer: 'A', correct: false },
          { answer: 'B', correct: true }
        ]
      });
      expect(result).toStrictEqual(ERROR400);
    });

    test('Points awarded for the question is less than 0', () => {
      const result = adminCreateQuizQuestion(quizId1, sessionId1, {
        question: 'Question?',
        duration: 3,
        points: -1,
        answers: [
          { answer: 'A', correct: false },
          { answer: 'B', correct: true }
        ]
      });
      expect(result).toStrictEqual(ERROR400);
    });

    test('Points awarded frot the question is more than 10', () => {
      const result = adminCreateQuizQuestion(quizId1, sessionId1, {
        question: 'Question?',
        duration: 3,
        points: 20,
        answers: [
          { answer: 'A', correct: false },
          { answer: 'B', correct: true }
        ]
      });
      expect(result).toStrictEqual(ERROR400);
    });

    test('Length of answer string is less than 1 characters', () => {
      const result = adminCreateQuizQuestion(quizId1, sessionId1, {
        question: 'Question?',
        duration: 3,
        points: 2,
        answers: [
          { answer: '', correct: false },
          { answer: 'B', correct: true }
        ]
      });
      expect(result).toStrictEqual(ERROR400);
    });

    test('Length of answer string is more than 30 characters', () => {
      const result = adminCreateQuizQuestion(quizId1, sessionId1, {
        question: 'Question?',
        duration: 3,
        points: 2,
        answers: [
          { answer: 'A'.repeat(50), correct: false },
          { answer: 'B', correct: true }
        ]
      });
      expect(result).toStrictEqual(ERROR400);
    });

    test('There are duplicate answer strings (in same question)', () => {
      const result = adminCreateQuizQuestion(quizId1, sessionId1, {
        question: 'Question?',
        duration: 3,
        points: 2,
        answers: [
          { answer: 'A', correct: false },
          { answer: 'A', correct: true }
        ]
      });
      expect(result).toStrictEqual(ERROR400);
    });

    test('Total quiz duration exceeds 3 minutes with multiple questions', () => {
      // Duration of validQuestion 2 is 150 seconds,
      // creating it twice will cause total quiz duration to go over 3 min.
      adminCreateQuizQuestion(quizId1, sessionId1, validQuestion2);
      const result = adminCreateQuizQuestion(quizId1, sessionId1, validQuestion2);
      expect(result).toStrictEqual(ERROR400);
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
      numQuestions: 1,
      questions: [validQuestion1],
      duration: expect.any(Number)
    });
  });
  test('Check that description time was updated successfully', () => {
    adminCreateQuizQuestion(quizId1, sessionId1, validQuestion1);
    const quizInfo = adminQuizInfo(sessionId1, quizId1);
    expect(quizInfo.jsonBody?.timeCreated).toBeLessThanOrEqual(
      quizInfo.jsonBody?.timeLastEdited);
  });

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
      numQuestions: 3,
      questions: [validQuestion1, validQuestion2, validQuestion3],
      duration: expect.any(Number)
    });
  });
  test('Check that questionId returned is unique', () => {
    const id1 = adminCreateQuizQuestion(quizId1, sessionId1, validQuestion1);
    const id2 = adminCreateQuizQuestion(quizId1, sessionId1, validQuestion2);
    expect(id1).not.toStrictEqual(id2);
  });

  test('Check that questionId is still unique after removing a question', () => {
    const id1 = adminCreateQuizQuestion(quizId1, sessionId1, validQuestion1);
    adminQuizQuestionDelete(sessionId1, quizId1, id1.jsonBody?.quesionId);
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
    const result1 = adminQuizInfo(sessionId1, quizId1).jsonBody;
    expect(result1).toStrictEqual({
      quizId: quizId1,
      name: 'Quiz 1',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Description',
      numQuestions: 2,
      questions: [validQuestion1, validQuestion2],
      duration: expect.any(Number)
    });
    const result2 = adminQuizInfo(sessionId1, quizId2).jsonBody;
    expect(result2).toStrictEqual({
      quizId: quizId2,
      name: 'Quiz 2',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Description of other quiz',
      numQuestions: 1,
      questions: [validQuestion3],
      duration: expect.any(Number)
    });
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
    const result1 = adminQuizInfo(sessionId1, quizId1).jsonBody;
    expect(result1).toStrictEqual({
      quizId: quizId1,
      name: 'Quiz 1',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Description',
      numQuestions: 2,
      questions: [validQuestion1, validQuestion2],
      duration: expect.any(Number)
    });
    const result2 = adminQuizInfo(sessionId2, quizId2).jsonBody;
    expect(result2).toStrictEqual({
      quizId: quizId2,
      name: 'Quiz 2',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Description of other quiz',
      numQuestions: 1,
      questions: [validQuestion3],
      duration: expect.any(Number)
    });
  });
});

//= ===========================================================================//
// V2 route tests
describe('v2 unsuccessful tests: thumbnail url', () => {
  test('url is an empty string', () => {
    const result = adminCreateQuizQuestionV2(
      quizId1,
      sessionId1,
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
      }
    );
    expect(result).toStrictEqual(ERROR400);
  });

  test('url is invalid file type', () => {
    const result = adminCreateQuizQuestionV2(
      quizId1,
      sessionId1,
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
      }
    );
    expect(result).toStrictEqual(ERROR400);
  });

  test('url does not begin with http or https', () => {
    const result = adminCreateQuizQuestionV2(
      quizId1,
      sessionId1,
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
      }
    );
    expect(result).toStrictEqual(ERROR400);
  });
});

describe('v2 successful question creation', () => {
  test('Valid inputs include thumbnail', () => {
    const result = adminCreateQuizQuestionV2(quizId1, sessionId1, validQuestion1V2);
    expect(result).toStrictEqual(SUCCESSFUL);
  });
});

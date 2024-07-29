import { ERROR400, ERROR401, ERROR403, validQuestion1V2 } from '../testConstants';
import {
  clear,
  adminAuthRegister,
  adminQuizCreate,
  adminQuizSessionStatus,
  adminQuizSessionStart,
  adminCreateQuizQuestionV2,
  playerJoin
} from '../wrappers';

let token1: string, token2: string;
let sessionId1: number;
let quizId1: number;
let questionId1: number;
beforeEach(() => {
  clear();
  token1 = adminAuthRegister(
    'admin1@gmail.com', 'SDFJKH2349081j', 'JJone', 'ZZ'
  ).jsonBody.token;
  token2 = adminAuthRegister(
    'admin2@gmail.com', 'SDFJKH2349081j', 'JJone', 'ZZ'
  ).jsonBody.token;
  quizId1 = adminQuizCreate(token1, 'Quiz 1', '1st description').jsonBody.quizId;
  questionId1 = adminCreateQuizQuestionV2(quizId1, token1, validQuestion1V2).jsonBody.questionId;
  sessionId1 = adminQuizSessionStart(quizId1, token1, 5).jsonBody.sessionId;
});

describe('Unsuccessful cases', () => {
  test('Error 401: token is invalid', () => {
    const res = adminQuizSessionStatus(quizId1, sessionId1, 'oioi');
    expect(res).toStrictEqual(ERROR401);
  });
  test('Error 401: token is empty', () => {
    const res = adminQuizSessionStatus(quizId1, sessionId1, '');
    expect(res).toStrictEqual(ERROR401);
  });
  test('Error 403: quiz does not exist', () => {
    const res = adminQuizSessionStatus(quizId1 - 99, sessionId1, token1);
    expect(res).toStrictEqual(ERROR403);
  });
  test('Error 403: user is not owner of quiz', () => {
    const quizId2 = adminQuizCreate(token2, 'Quiz 2', '2nd description').jsonBody.quizId;
    const sessionId2 = adminQuizSessionStart(quizId2, token2, 5).jsonBody.sessionId;
    const res = adminQuizSessionStatus(quizId2, sessionId2, token1);
    expect(res).toStrictEqual(ERROR403);
  });

  test.failing('Error 400: sessionId does not refer to valid session within this quiz', () => {
    const quizId2 = adminQuizCreate(token2, 'Quiz 2', '2nd description').jsonBody.quizId;
    const sessionId2 = adminQuizSessionStart(quizId2, token2, 5).jsonBody.sessionId;
    const res = adminQuizSessionStatus(quizId1, sessionId2, token1);
    expect(res).toStrictEqual(ERROR400);
  });
});

describe('Successful cases', () => {
  test.failing('Successfully view session status with only 1 session existing', () => {
    const res = adminQuizSessionStatus(quizId1, sessionId1, token1);
    expect(res).toStrictEqual({
      state: 'LOBBY',
      atQuestion: 0,
      players: [],
      metadata: {
        quizId: quizId1,
        name: 'Quiz 1',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: '1st description',
        numQuestions: 1,
        questions: [{
          questionId: questionId1,
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
          thumbnailUrl: 'http://google.com/some/image/path.jpg'
        }],
        duration: 3,
        thumbnailUrl: 'http://google.com/some/image/path.jpg'
      }
    });
  });
  test.failing('Successfully view session status with multiple sessionse existing', () => {
    const sessionId2 = adminQuizSessionStart(quizId1, token1, 5).jsonBody.sessionId;
    const res = adminQuizSessionStatus(quizId1, sessionId2, token1);
    expect(res).toStrictEqual({
      state: 'LOBBY',
      atQuestion: 0,
      players: [],
      metadata: {
        quizId: quizId1,
        name: 'Quiz 1',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: '1st description',
        numQuestions: 1,
        questions: [{
          questionId: questionId1,
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
          thumbnailUrl: 'http://google.com/some/image/path.jpg'
        }],
        duration: 3,
        thumbnailUrl: 'http://google.com/some/image/path.jpg'
      }
    });
  });

  test.failing('Check players are in ascending order', () => {
    playerJoin(sessionId1, 'AAAA');
    playerJoin(sessionId1, 'Abbb');
    playerJoin(sessionId1, 'cdeerr4');
    const res = adminQuizSessionStatus(quizId1, sessionId1, token1);
    expect(res).toStrictEqual({
      state: 'LOBBY',
      atQuestion: 0,
      players: [
        'AAAA',
        'Abbb',
        'cdeerr4'
      ],
      metadata: {
        quizId: quizId1,
        name: 'Quiz 1',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: '1st description',
        numQuestions: 1,
        questions: [{
          questionId: questionId1,
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
          thumbnailUrl: 'http://google.com/some/image/path.jpg'
        }],
        duration: 3,
        thumbnailUrl: 'http://google.com/some/image/path.jpg'
      }
    });
  });
});

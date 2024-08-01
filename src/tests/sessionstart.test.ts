import { ERROR400, ERROR401, ERROR403, validQuestion1V2 } from '../testConstants';
import {
  clear,
  adminAuthRegister,
  adminQuizCreate,
  adminCreateQuizQuestionV2,
  adminQuizSessionStart,
  adminAuthLogin,
  playerJoin, adminQuizInfo, adminQuizRemoveV2, 
  adminQuizSessionView
} from '../wrappers';

const SUCCESS = {
  statusCode: 200,
  jsonBody: {
    sessionId: expect.any(Number)
  }
};

let token1: string;
let sessionId1: number;
let quizId1: number;
beforeEach(() => {
  clear();
  token1 = adminAuthRegister(
    'admin1@gmail.com', 'SDFJKH2349081j', 'JJone', 'ZZ'
  ).jsonBody.token;
  quizId1 = adminQuizCreate(token1, 'Quiz 1', '1st description').jsonBody.quizId;
  adminCreateQuizQuestionV2(quizId1, token1, validQuestion1V2);
});

describe('Unsuccessful tests', () => {
  test('autoStartNum is greater than 50', () => {
    const res = adminQuizSessionStart(quizId1, token1, 51);
  
    expect(res).toStrictEqual(ERROR400);
  });

  test('10 sessions are already active for the quiz', () => {
      adminQuizSessionStart(quizId1, token1, 1);
      adminQuizSessionStart(quizId1, token1, 1);
      adminQuizSessionStart(quizId1, token1, 1);
      adminQuizSessionStart(quizId1, token1, 1);
      adminQuizSessionStart(quizId1, token1, 1);
      adminQuizSessionStart(quizId1, token1, 1);
      adminQuizSessionStart(quizId1, token1, 1);
      adminQuizSessionStart(quizId1, token1, 1);
      adminQuizSessionStart(quizId1, token1, 1);
      adminQuizSessionStart(quizId1, token1, 1);
    const res = adminQuizSessionStart(quizId1, token1, 1);
    expect(res).toStrictEqual(ERROR400);
  });

  test('The quiz does not have any questions', () => {
    const quiz2 = adminQuizCreate(token1, 'name', 'hih').jsonBody.quizId
    const res = adminQuizSessionStart(quiz2, token1, 3);
    expect(res).toStrictEqual(ERROR400);
  });

  test.only('The quiz is in trash', () => {
    adminQuizRemoveV2(token1, quizId1);
    const res2 = adminQuizSessionStart(quizId1, token1, 3);
    expect(res2).toStrictEqual(ERROR400);
  });

  test('Token is empty or invalid', () => {
    const res = adminQuizSessionStart(quizId1, token1 + '-999', 3);
    expect(res).toStrictEqual(ERROR401);
  });

  test('Valid token but user is not the owner', () => {
    const token2 = adminAuthRegister('admin2@ad.unsw.ed.au', 'SDFJKH2349081j', 'JJone', 'ZZ').jsonBody.token;
    const res = adminQuizSessionStart(quizId1, token2, 3); // Assume 'another_user_token' is for a non-owner
    expect(res).toStrictEqual(ERROR403);
  });
});

describe('Successful tests', () => {
  test('Successful session start', () => {
    const res = adminQuizSessionStart(quizId1, token1, 3);
    expect(res).toStrictEqual(SUCCESS);
    sessionId1 = res.jsonBody.sessionId;
  });

  test('Check if sessions can be started with same user but different tokens', () => {
    const token2 = adminAuthLogin('admin1@gmail.com', 'SDFJKH2349081j').jsonBody.token;
    const res1 = adminQuizSessionStart(quizId1, token1, 3);
    const res2 = adminQuizSessionStart(quizId1, token2, 3);
    expect(res1).toStrictEqual(SUCCESS);
    expect(res2).toStrictEqual(SUCCESS);
    expect(adminQuizSessionView(token1, quizId1).jsonBody).toStrictEqual({
      activeSessions: [ res1.jsonBody.sessionId, res2.jsonBody.sessionId ],
      inactiveSessions: []
    });
  });
});

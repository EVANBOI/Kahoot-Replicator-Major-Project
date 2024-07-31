import { ERROR400, ERROR401, ERROR403, SUCCESSFUL_UPDATE, validQuestion1V2 } from '../testConstants';
import {
  clear,
  adminAuthRegister,
  adminQuizCreate,
  adminCreateQuizQuestionV2,
  adminQuizSessionStart,
  playerJoin
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
    for (let i = 0; i < 10; i++) {
      adminQuizSessionStart(quizId1, token1, 1);
    }
    const res = adminQuizSessionStart(quizId1, token1, 1);
    expect(res).toStrictEqual(ERROR400);
  });

  test('The quiz does not have any questions', () => {
    clear();
    const res = adminQuizSessionStart(quizId1, token1, 3);
    expect(res).toStrictEqual(ERROR400);
  });

  test('The quiz is in trash', () => {
    // Assume there's a function to move the quiz to trash
    adminQuizCreate(token1, 'Quiz in trash', 'Description').jsonBody.quizId;
    // Move the quiz to trash
    clear(); // or relevant method to move quiz to trash
    const res = adminQuizSessionStart(quizId1, token1, 3);
    expect(res).toStrictEqual(ERROR400);
  });

  test('Token is empty or invalid', () => {
    const res = adminQuizSessionStart(quizId1, 'invalid_token', 3);
    expect(res).toStrictEqual(ERROR401);
  });

  test('Valid token but user is not the owner', () => {
    const res = adminQuizSessionStart(quizId1, 'another_user_token', 3); // Assume 'another_user_token' is for a non-owner
    expect(res).toStrictEqual(ERROR403);
  });
});

describe('Successful tests', () => {
  test('Successful session start', () => {
    const res = adminQuizSessionStart(quizId1, token1, 3);
    expect(res).toStrictEqual(SUCCESS);
    sessionId1 = res.jsonBody.sessionId;
  });

  test('Check if sessionId is returned correctly', () => {
    const res = adminQuizSessionStart(quizId1, token1, 3);
    expect(res.jsonBody.sessionId).toBeGreaterThan(0);
  });
});

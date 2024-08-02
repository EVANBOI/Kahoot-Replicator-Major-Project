import { SessionAction } from '../session';
import { ERROR400, validQuestion1V2, validQuestion2V2 } from '../testConstants';
import {
  clear,
  adminAuthRegister,
  adminQuizCreate,
  adminCreateQuizQuestionV2,
  adminQuizSessionStart,
  playerJoin,
  adminQuizSessionUpdate,
  playerQuestionInfo
} from '../wrappers';

let token1: string;
let sessionId1: number;
let quizId1: number;
let questionId1: number;
let playerId1: number;
beforeEach(() => {
  clear();
  token1 = adminAuthRegister(
    'admin1@gmail.com', 'SDFJKH2349081j', 'JJone', 'ZZ'
  ).jsonBody.token;
  quizId1 = adminQuizCreate(token1, 'Quiz 1', '1st description').jsonBody.quizId;
  questionId1 = adminCreateQuizQuestionV2(quizId1, token1, validQuestion1V2).jsonBody.questionId;
  sessionId1 = adminQuizSessionStart(quizId1, token1, 5).jsonBody.sessionId;
  playerId1 = playerJoin(sessionId1, 'Yooiuiudsf').jsonBody.playerId;
});

describe('Unsuccessful cases', () => {
  test.skip('player id does not exist', () => {
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
    expect(playerQuestionInfo(playerId1 + 1, 1)).toStrictEqual(ERROR400);
  });
  test.skip('question position is not valid for player in current session', () => {
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
    expect(playerQuestionInfo(playerId1, 50)).toStrictEqual(ERROR400);
  });
  test.skip('session is not currently on this question', () => {
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
    expect(playerQuestionInfo(playerId1, 2)).toStrictEqual(ERROR400);
  });
  test.skip('Session is in LOBBY', () => {
    expect(playerQuestionInfo(playerId1, 1)).toStrictEqual(ERROR400);
  });

  test.skip('Session is in QUESTION_COUNTDOWN', () => {
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    expect(playerQuestionInfo(playerId1, 2)).toStrictEqual(ERROR400);
  });
  test.skip('Session is in FINAL_RESULTS ', () => {
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_ANSWER);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_FINAL_RESULTS);
    expect(playerQuestionInfo(playerId1, 1)).toStrictEqual(ERROR400);
  });
  test.skip('Session is in END ', () => {
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.END);
    expect(playerQuestionInfo(playerId1, 1)).toStrictEqual(ERROR400);
  });
});

describe('Successful cases', () => {
  test.skip('All valid inputs and player is on first question', () => {
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
    expect(playerQuestionInfo(playerId1, 1)).toStrictEqual({
      questionId: questionId1,
      question: validQuestion1V2.question,
      duration: validQuestion1V2.duration,
      thumbnailUrl: validQuestion1V2.thumbnailUrl,
      points: validQuestion1V2.points,
      answers: validQuestion1V2.answers
    });
  });

  test.skip('All valid inputs and player is on second question', () => {
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
    expect(playerQuestionInfo(playerId1, 2)).toStrictEqual({
      questionId: questionId1,
      question: validQuestion2V2.question,
      duration: validQuestion2V2.duration,
      thumbnailUrl: validQuestion2V2.thumbnailUrl,
      points: validQuestion2V2.points,
      answers: validQuestion2V2.answers
    });
  });

  test.skip('Multiple players are on the same session', () => {
    const playerId2 = playerJoin(sessionId1, 'yoooooo').jsonBody.playerId;
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
    // should both players on the question 1
    expect(playerQuestionInfo(playerId1, 1)).toStrictEqual({
      questionId: questionId1,
      question: validQuestion1V2.question,
      duration: validQuestion1V2.duration,
      thumbnailUrl: validQuestion1V2.thumbnailUrl,
      points: validQuestion1V2.points,
      answers: validQuestion1V2.answers
    });
    expect(playerQuestionInfo(playerId2, 1)).toStrictEqual({
      questionId: questionId1,
      question: validQuestion1V2.question,
      duration: validQuestion1V2.duration,
      thumbnailUrl: validQuestion1V2.thumbnailUrl,
      points: validQuestion1V2.points,
      answers: validQuestion1V2.answers
    });
  });

  test.skip('Two sessions exsit simultaneously for same quiz', () => {
    // Start a second session and have a player join
    const sessionId2 = adminQuizSessionStart(quizId1, token1, 10).jsonBody.sessionId;
    const playerId2 = playerJoin(sessionId2, 'yoooooo').jsonBody.playerId;
    // First session is on 2nd question
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
    // Second session is on 1st question
    adminQuizSessionUpdate(quizId1, sessionId2, token1, SessionAction.NEXT_QUESTION);
    adminQuizSessionUpdate(quizId1, sessionId2, token1, SessionAction.SKIP_COUNTDOWN);
    // Should see question 2 for player 1
    expect(playerQuestionInfo(playerId1, 1)).toStrictEqual({
      questionId: questionId1,
      question: validQuestion2V2.question,
      duration: validQuestion2V2.duration,
      thumbnailUrl: validQuestion2V2.thumbnailUrl,
      points: validQuestion2V2.points,
      answers: validQuestion2V2.answers
    });
    // Should see question 1 for player 2
    expect(playerQuestionInfo(playerId2, 2)).toStrictEqual({
      questionId: questionId1,
      question: validQuestion1V2.question,
      duration: validQuestion1V2.duration,
      thumbnailUrl: validQuestion1V2.thumbnailUrl,
      points: validQuestion1V2.points,
      answers: validQuestion1V2.answers
    });
  });
});

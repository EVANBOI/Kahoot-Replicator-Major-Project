import { SessionAction } from '../session';
import { ERROR400, validQuestion1V2, validQuestion3V2 } from '../testConstants';
import sleepSync from 'slync';
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
let questionId1: number, questionId2:number;
let playerId1: number;
beforeEach(() => {
  clear();
  token1 = adminAuthRegister(
    'admin1@gmail.com', 'SDFJKH2349081j', 'JJone', 'ZZ'
  ).jsonBody.token;
  quizId1 = adminQuizCreate(token1, 'Quiz 1', '1st description').jsonBody.quizId;
  questionId1 = adminCreateQuizQuestionV2(quizId1, token1, validQuestion1V2).jsonBody.questionId;
  questionId2 = adminCreateQuizQuestionV2(quizId1, token1, validQuestion3V2).jsonBody.questionId;
  sessionId1 = adminQuizSessionStart(quizId1, token1, 5).jsonBody.sessionId;
  playerId1 = playerJoin(sessionId1, 'erwr').jsonBody.playerId;
});

describe('Unsuccessful cases', () => {
  test('player id does not exist', () => {
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
    expect(playerQuestionInfo(playerId1 + 1, 1)).toStrictEqual(ERROR400);
  });
  test('question position is not valid for player in current session', () => {
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
    expect(playerQuestionInfo(playerId1, 50)).toStrictEqual(ERROR400);
  });
  test('session is not currently on this question', () => {
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
    expect(playerQuestionInfo(playerId1, 2)).toStrictEqual(ERROR400);
  });
  test('Session is in LOBBY', () => {
    expect(playerQuestionInfo(playerId1, 1)).toStrictEqual(ERROR400);
  });

  test('Session is in QUESTION_COUNTDOWN', () => {
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    expect(playerQuestionInfo(playerId1, 2)).toStrictEqual(ERROR400);
  });
  test('Session is in FINAL_RESULTS ', () => {
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_ANSWER);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_FINAL_RESULTS);
    expect(playerQuestionInfo(playerId1, 1)).toStrictEqual(ERROR400);
  });
  test('Session is in END ', () => {
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.END);
    expect(playerQuestionInfo(playerId1, 1)).toStrictEqual(ERROR400);
  });
});

describe('Successful cases', () => {
  test('All valid inputs and player is on first question', () => {
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
    expect(playerQuestionInfo(playerId1, 1).statusCode).toStrictEqual(200);
    expect(playerQuestionInfo(playerId1, 1).jsonBody).toStrictEqual({
      questionId: questionId1,
      question: validQuestion1V2.question,
      duration: validQuestion1V2.duration,
      thumbnailUrl: validQuestion1V2.thumbnailUrl,
      points: validQuestion1V2.points,
      answers: validQuestion1V2.answers
    });
  });

  test('All valid inputs and player is on second question', () => {
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
    sleepSync(validQuestion1V2.duration * 1000)
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
    expect(playerQuestionInfo(playerId1, 2).jsonBody).toStrictEqual({
      questionId: questionId2,
      question: validQuestion3V2.question,
      duration: validQuestion3V2.duration,
      thumbnailUrl: validQuestion3V2.thumbnailUrl,
      points: validQuestion3V2.points,
      answers: validQuestion3V2.answers
    });
  });

  test('Multiple players are on the same session', () => {
    const playerId2 = playerJoin(sessionId1, 'yoooooo').jsonBody.playerId;
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
    // should both players on the question 1
    expect(playerQuestionInfo(playerId1, 1).jsonBody).toStrictEqual({
      questionId: questionId1,
      question: validQuestion1V2.question,
      duration: validQuestion1V2.duration,
      thumbnailUrl: validQuestion1V2.thumbnailUrl,
      points: validQuestion1V2.points,
      answers: validQuestion1V2.answers
    });
    expect(playerQuestionInfo(playerId2, 1).jsonBody).toStrictEqual({
      questionId: questionId1,
      question: validQuestion1V2.question,
      duration: validQuestion1V2.duration,
      thumbnailUrl: validQuestion1V2.thumbnailUrl,
      points: validQuestion1V2.points,
      answers: validQuestion1V2.answers
    });
  });

  test('Two sessions exsit simultaneously for same quiz', () => {
    // Start a second session and have a player join
    const sessionId2 = adminQuizSessionStart(quizId1, token1, 10).jsonBody.sessionId;
    const playerId2 = playerJoin(sessionId2, 'yoooooo').jsonBody.playerId;
    // First session is on 2nd question
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
    sleepSync(validQuestion1V2.duration * 1000);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
    // Second session is on 1st question
    adminQuizSessionUpdate(quizId1, sessionId2, token1, SessionAction.NEXT_QUESTION);
    adminQuizSessionUpdate(quizId1, sessionId2, token1, SessionAction.SKIP_COUNTDOWN);
    // Should see question 2 for player 1
    expect(playerQuestionInfo(playerId1, 2).jsonBody).toStrictEqual({
      questionId: questionId2,
      question: validQuestion3V2.question,
      duration: validQuestion3V2.duration,
      thumbnailUrl: validQuestion3V2.thumbnailUrl,
      points: validQuestion3V2.points,
      answers: validQuestion3V2.answers
    });
    // Should see question 1 for player 2
    expect(playerQuestionInfo(playerId2, 1).jsonBody).toStrictEqual({
      questionId: questionId1,
      question: validQuestion1V2.question,
      duration: validQuestion1V2.duration,
      thumbnailUrl: validQuestion1V2.thumbnailUrl,
      points: validQuestion1V2.points,
      answers: validQuestion1V2.answers
    });
  });
});

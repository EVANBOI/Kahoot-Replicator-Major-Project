import {
  ERROR400, VALID_USER_REGISTER_INPUTS_1, VALID_QUIZ_CREATE_INPUTS_1,
  validQuestion1V2, validQuestion2V2,
} from '../testConstants';
import {
  clear,
  adminAuthRegister,
  adminQuizCreateV2,
  adminQuizSessionUpdate,
  adminQuizSessionStart,
  adminCreateQuizQuestionV2,
  playerJoin,
  playerQuestionResult,
  adminQuizInfoV2,
  playerQuestionAnswer
} from '../wrappers';

import { QuizInfoResult } from '../types';
import { SessionAction } from '../session';

let token1: string;
let sessionId1: number;
let quizId1: number;
let questionId1: number;
let playerId1: number;
let validAnswerIds: number[];

beforeEach(() => {
  clear();
  token1 = adminAuthRegister(
    VALID_USER_REGISTER_INPUTS_1.EMAIL,
    VALID_USER_REGISTER_INPUTS_1.PASSWORD,
    VALID_USER_REGISTER_INPUTS_1.FIRSTNAME,
    VALID_USER_REGISTER_INPUTS_1.LASTNAME
  ).jsonBody.token;
  quizId1 = adminQuizCreateV2(
    token1,
    VALID_QUIZ_CREATE_INPUTS_1.NAME,
    VALID_QUIZ_CREATE_INPUTS_1.DESCRIPTION
  ).jsonBody.quizId;
  questionId1 = adminCreateQuizQuestionV2(quizId1, token1, validQuestion1V2).jsonBody.questionId;
  adminCreateQuizQuestionV2(quizId1, token1, validQuestion2V2);
  sessionId1 = adminQuizSessionStart(quizId1, token1, 5).jsonBody.sessionId;
  playerId1 = playerJoin(sessionId1, 'Hayden').jsonBody.playerId;
});

describe('Get /v1/player/{playerid}/question/{questionposition}/results', () => {
  describe('error cases', () => {
    test('Error 400: player ID does not exist', () => {
      expect(playerQuestionResult(playerId1 + 1, 1)).toStrictEqual(ERROR400);
    });
    test('Error 400: question position is not valid for the session this player is in', () => {
      expect(playerQuestionResult(playerId1, 3)).toStrictEqual(ERROR400);
    });
    test('Error 400: Session is not in ANSWER_SHOW state', () => {
      expect(playerQuestionResult(playerId1, 1)).toStrictEqual(ERROR400);
    });
    test('Error 400: session is not currently on this question', () => {
      adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
      adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
      adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_ANSWER);
      adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
      adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
      adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_ANSWER);
      expect(playerQuestionResult(playerId1, 1)).toStrictEqual(ERROR400);
    });
  });
  describe('success cases', () => {
    test('no one submit the answer', () => {
      adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
      adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
      adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_ANSWER);
      const res = playerQuestionResult(playerId1, 1);
      expect(res).toStrictEqual({
        statusCode: 200,
        jsonBody: {
          questionId: questionId1,
          playersCorrectList: [],
          averageAnswerTime: expect.any(Number),
          percentCorrect: expect.any(Number)
        }
      });
    });
    test('Hayden submited correct, Yuchao submited wrong', () => {
      const playerId2 = playerJoin(sessionId1, 'Yuchao').jsonBody.playerId;
      adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
      adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
      const quizInfo = adminQuizInfoV2(token1, quizId1).jsonBody as QuizInfoResult;
      validAnswerIds = quizInfo.questions
        .find(question => question.questionId === questionId1).answers.map(answer => answer.answerId);
      playerQuestionAnswer(playerId1, 1, validAnswerIds);
      playerQuestionAnswer(playerId2, 1, [0]);
      adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_ANSWER);

      expect(playerQuestionResult(playerId1, 1)).toStrictEqual({
        statusCode: 200,
        jsonBody: {
          questionId: questionId1,
          playersCorrectList: [
            'Hayden'
          ],
          averageAnswerTime: expect.any(Number),
          percentCorrect: 50
        }
      });
    });
    test('both of them submited correct', () => {
      const playerId2 = playerJoin(sessionId1, 'Yuchao').jsonBody.playerId;
      adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
      adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
      const quizInfo = adminQuizInfoV2(token1, quizId1).jsonBody as QuizInfoResult;
      validAnswerIds = quizInfo.questions
        .find(question => question.questionId === questionId1).answers.map(answer => answer.answerId);
      playerQuestionAnswer(playerId1, 1, validAnswerIds);
      playerQuestionAnswer(playerId2, 1, validAnswerIds);
      adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_ANSWER);

      expect(playerQuestionResult(playerId1, 1)).toStrictEqual({
        statusCode: 200,
        jsonBody: {
          questionId: questionId1,
          playersCorrectList: [
            'Hayden',
            'Yuchao'
          ],
          averageAnswerTime: expect.any(Number),
          percentCorrect: 100
        }
      });
    });
    test('both of them submited wrong', () => {
      const playerId2 = playerJoin(sessionId1, 'Yuchao').jsonBody.playerId;
      adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
      adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
      const quizInfo = adminQuizInfoV2(token1, quizId1).jsonBody as QuizInfoResult;
      validAnswerIds = quizInfo.questions
        .find(question => question.questionId === questionId1).answers.map(answer => answer.answerId);
      const wrongId = [3214212];
      playerQuestionAnswer(playerId1, 1, wrongId);
      playerQuestionAnswer(playerId2, 1, wrongId);
      adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_ANSWER);

      expect(playerQuestionResult(playerId1, 1)).toStrictEqual({
        statusCode: 200,
        jsonBody: {
          questionId: questionId1,
          playersCorrectList: [],
          averageAnswerTime: expect.any(Number),
          percentCorrect: 0
        }
      });
    });
  });
});

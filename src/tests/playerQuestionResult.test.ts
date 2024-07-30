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
  adminQuizSessionStatus,
  adminQuizInfo,
  playerQuestionAnswer
} from '../wrappers';

import { QuestionBody } from '../types';

let token1: string;
let sessionId1: number;
let quizId1: number;
let questionId1: number;
let playerId1: number;

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
      // failling cuz of adminQuizSessionUpdate
      adminQuizSessionUpdate(quizId1, sessionId1, token1, 'GO_TO_ANSWER');
      expect(playerQuestionResult(playerId1 + 1, 1)).toStrictEqual(ERROR400);
    });
    test('Error 400: question position is not valid for the session this player is in', () => {
      adminQuizSessionUpdate(quizId1, sessionId1, token1, 'GO_TO_ANSWER');
      expect(playerQuestionResult(playerId1, 3)).toStrictEqual(ERROR400);
    });
    test('Error 400: Session is not in ANSWER_SHOW state', () => {
      expect(playerQuestionResult(playerId1, 1)).toStrictEqual(ERROR400);
    });
    test.failing('Error 400: session is not currently on this question', () => {
      expect(adminQuizSessionStatus(questionId1, sessionId1, token1).jsonBody.atQuestion).toStrictEqual(1);
      expect(playerQuestionResult(playerId1, 2)).toStrictEqual(ERROR400);
    });
  });
  describe('success cases', () => {
    test.failing('no one submit the answer', () => {
      adminQuizSessionUpdate(quizId1, sessionId1, token1, 'GO_TO_ANSWER');
      expect(playerQuestionResult(playerId1, 1)).toStrictEqual({
        statusCode: 200,
        jsonBody: {
          questionId: questionId1,
          playersCorrectList: [],
          averageAnswerTime: expect.any(Number),
          percentCorrect: expect.any(Number)
        }
      });
    });
    test.failing('Hayden submited correct, Yuchao submited wrong', () => {
      const questions: QuestionBody[] = adminQuizInfo(token1, quizId1).jsonBody.questions;
      const correctAnswerId = questions[0].answers.find(answer => answer.correct).answerId;
      const wrongAnswerId = questions[0].answers.find(answer => !answer.correct).answerId;
      const playerId2 = playerJoin(sessionId1, 'Yuchao').jsonBody.playerId;
      playerQuestionAnswer(playerId1, 1, [correctAnswerId]);
      playerQuestionAnswer(playerId2, 1, [wrongAnswerId]);

      adminQuizSessionUpdate(quizId1, sessionId1, token1, 'GO_TO_ANSWER');
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
    test.failing('both of them submited correct', () => {
      const questions: QuestionBody[] = adminQuizInfo(token1, quizId1).jsonBody.questions;
      const correctAnswerId = questions[0].answers.find(answer => answer.correct).answerId;
      const playerId2 = playerJoin(sessionId1, 'Yuchao').jsonBody.playerId;
      playerQuestionAnswer(playerId1, 1, [correctAnswerId]);
      playerQuestionAnswer(playerId2, 1, [correctAnswerId]);

      adminQuizSessionUpdate(quizId1, sessionId1, token1, 'GO_TO_ANSWER');
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
    test.failing('both of them submited wrong', () => {
      const questions: QuestionBody[] = adminQuizInfo(token1, quizId1).jsonBody.questions;
      const wrongAnswerId = questions[0].answers.find(answer => !answer.correct).answerId;
      const playerId2 = playerJoin(sessionId1, 'Yuchao').jsonBody.playerId;
      playerQuestionAnswer(playerId1, 1, [wrongAnswerId]);
      playerQuestionAnswer(playerId2, 1, [wrongAnswerId]);

      adminQuizSessionUpdate(quizId1, sessionId1, token1, 'GO_TO_ANSWER');
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

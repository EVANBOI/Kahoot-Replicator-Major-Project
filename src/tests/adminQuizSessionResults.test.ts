import {
  ERROR400, 
  ERROR401, 
  ERROR403, 
  VALID_USER_REGISTER_INPUTS_1, 
  VALID_USER_REGISTER_INPUTS_2, 
  VALID_QUIZ_CREATE_INPUTS_1, 
  validQuestion1V2, 
  validQuestion3V2
} from '../testConstants';
import sleepSync from 'slync';
import {
  clear,
  adminAuthRegister,
  adminQuizCreateV2,
  adminCreateQuizQuestionV2,
  adminQuizSessionStart,
  playerJoin,
  playerQuestionAnswer,
  adminQuizSessionResults,
  adminQuizSessionUpdate,
  adminQuizInfoV2
} from '../wrappers';

import { QuestionBody } from '../types';
import { SessionAction, SessionStatus } from '../session';

let token1: string;
let sessionId1: number;
let quizId1: number;
let questionId1: number, questionId2: number;
let playerId1: number, playerId2: number;

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
  questionId2 = adminCreateQuizQuestionV2(quizId1, token1, validQuestion3V2).jsonBody.questionId;
  sessionId1 = adminQuizSessionStart(quizId1, token1, 5).jsonBody.sessionId;
  playerId1 = playerJoin(sessionId1, 'Player1').jsonBody.playerId;
  playerId2 = playerJoin(sessionId1, 'Player2').jsonBody.playerId;
});

describe('Get /v1/admin/quiz/{quizid}/session/{sessionid}/results', () => {
  describe('error cases', () => {
    test('Error 400: session ID does not exist', () => {
      const res = adminQuizSessionResults(quizId1, sessionId1 + 1, token1);
      expect(res).toStrictEqual(ERROR400);
    });
    test('Error 401: token is invalid', () => {
      const res = adminQuizSessionResults(quizId1, sessionId1, 'invalid_token');
      expect(res).toStrictEqual(ERROR401);
    });
    test('Error 403: user is not owner of quiz', () => {
      const token2 = adminAuthRegister(
        VALID_USER_REGISTER_INPUTS_2.EMAIL,
        VALID_USER_REGISTER_INPUTS_2.PASSWORD,
        VALID_USER_REGISTER_INPUTS_2.FIRSTNAME,
        VALID_USER_REGISTER_INPUTS_2.LASTNAME
      ).jsonBody.token;
      const res = adminQuizSessionResults(quizId1, sessionId1, token2);
      expect(res).toStrictEqual(ERROR403);
    });
    test('Error 403: quiz does not exist', () => {
      const res = adminQuizSessionResults(quizId1 + 1, sessionId1, token1);
      expect(res).toStrictEqual(ERROR403);
    });
  });

  describe('success cases', () => {
    test.skip('Successfully get session results', () => {
      const questions: QuestionBody[] = adminQuizInfoV2(token1, quizId1).jsonBody.questions;
      const correctAnswerId1 = questions[0].answers.find(answer => answer.correct).answerId;
      const correctAnswerId2 = questions[1].answers.find(answer => answer.correct).answerId;
      
      adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
      adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
      playerQuestionAnswer(playerId1, 1, [correctAnswerId1]);
      playerQuestionAnswer(playerId2, 1, [correctAnswerId1]);
      sleepSync(3 * 1000);
      adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
      adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
      playerQuestionAnswer(playerId1, 2, [correctAnswerId2]);
      playerQuestionAnswer(playerId2, 2, [correctAnswerId2]);
      const res = adminQuizSessionResults(quizId1, sessionId1, token1);
      expect(res.statusCode).toBe(200);
      expect(res.jsonBody).toStrictEqual({
        usersRankedByScore: [
          { name: 'Player1', score: expect.any(Number) },
          { name: 'Player2', score: expect.any(Number) }
        ],
        questionResults: [
          {
            questionId: questionId1,
            playersCorrectList: ['Player1', 'Player2'],
            averageAnswerTime: expect.any(Number),
            percentCorrect: 100
          },
          {
            questionId: questionId2,
            playersCorrectList: ['Player1', 'Player2'],
            averageAnswerTime: expect.any(Number),
            percentCorrect: 100
          }
        ]
      });
    });
  });
});

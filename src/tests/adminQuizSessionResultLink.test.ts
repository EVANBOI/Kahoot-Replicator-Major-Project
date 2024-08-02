import { SessionAction } from '../session';
import {
  ERROR401, ERROR403, ERROR400, VALID_USER_REGISTER_INPUTS_1, VALID_USER_REGISTER_INPUTS_2,
  VALID_QUIZ_CREATE_INPUTS_1, validQuestion1V2
} from '../testConstants';
import {
  clear,
  adminAuthRegister,
  adminQuizCreateV2,
  adminQuizSessionUpdate,
  adminQuizSessionStart,
  adminCreateQuizQuestionV2,
  playerJoin,
  adminQuizSessionResultLink,
  getCsvData
} from '../wrappers';

let token1: string;
let sessionId1: number;
let quizId1: number;

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
  adminCreateQuizQuestionV2(quizId1, token1, validQuestion1V2);
  sessionId1 = adminQuizSessionStart(quizId1, token1, 5).jsonBody.sessionId;
  playerJoin(sessionId1, 'Hayden');
});

describe('GET /v1/admin/quiz/{quizid}/session/{sessionid}/results/csv', () => {
  describe('error cases', () => {
    test.skip('Error 401: token is empty', () => {
      expect(adminQuizSessionResultLink(quizId1, sessionId1, '')).toStrictEqual(ERROR401);
    });
    test.skip('Error 401: token is invalid', () => {
      expect(adminQuizSessionResultLink(quizId1, sessionId1, token1 + 1)).toStrictEqual(ERROR401);
    });
    test.skip('Error 403: quiz does not exist', () => {
      expect(adminQuizSessionResultLink(quizId1 + 1, sessionId1, token1)).toStrictEqual(ERROR403);
    });
    test.skip('Error 403: user is not owner of quiz', () => {
      const token2 = adminAuthRegister(
        VALID_USER_REGISTER_INPUTS_2.EMAIL,
        VALID_USER_REGISTER_INPUTS_2.PASSWORD,
        VALID_USER_REGISTER_INPUTS_2.FIRSTNAME,
        VALID_USER_REGISTER_INPUTS_2.LASTNAME
      ).jsonBody.token;
      expect(adminQuizSessionResultLink(quizId1, sessionId1, token2)).toStrictEqual(ERROR403);
    });
    test.skip('Error 400: session Id does not refer to a valid session within this quiz', () => {
      expect(adminQuizSessionResultLink(quizId1, sessionId1 + 1, token1)).toStrictEqual(ERROR400);
    });
    test.skip('Error 400: session is not in FINAL_RESULTS state', () => {
      adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
      expect(adminQuizSessionResultLink(quizId1, sessionId1, token1)).toStrictEqual(ERROR400);
    });
  });
  describe('success cases', () => {
    test.skip('Successfully return URL with CSV file', () => {
      adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_FINAL_RESULTS);
      const result = adminQuizSessionResultLink(quizId1, sessionId1, token1).jsonBody;
      expect(result).toMatch(/https:/);
      expect(result).toMatch(/.csv/);
    });
    test.skip('The final result is transfered to CSV sucessfully', () => {
      adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_FINAL_RESULTS);
      const url = adminQuizSessionResultLink(quizId1, sessionId1, token1).jsonBody.url;
      const csvData = getCsvData(url);
      expect(csvData).toStrictEqual('Player,question1score,question1rank\nHayden,0,1\n');
    });
  });
});

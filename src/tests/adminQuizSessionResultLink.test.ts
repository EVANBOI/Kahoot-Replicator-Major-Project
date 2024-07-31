import {
    ERROR401, ERROR403, ERROR400, VALID_USER_REGISTER_INPUTS_1, VALID_USER_REGISTER_INPUTS_2, 
    VALID_QUIZ_CREATE_INPUTS_1, validQuestion1V2, validQuestion2V2
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
    playerQuestionAnswer,
    adminQuizSessionResultLink,
    getCsvData
  } from '../wrappers';
  
  
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
    sessionId1 = adminQuizSessionStart(quizId1, token1, 5).jsonBody.sessionId;
    playerId1 = playerJoin(sessionId1, 'Hayden').jsonBody.playerId;
  })

  describe('GET /v1/admin/quiz/{quizid}/session/{sessionid}/results/csv', () => {
    describe('error cases', () => {
        test('Error 401: token is empty', () => {
            expect(adminQuizSessionResultLink(quizId1, sessionId1, '')).toStrictEqual(ERROR401);
        });
        test('Error 401: token is invalid', () => {
            expect(adminQuizSessionResultLink(quizId1, sessionId1, token1 + 1)).toStrictEqual(ERROR401);
        });
        test('Error 403: quiz does not exist', () => {
            console.log(adminQuizSessionResultLink(quizId1 + 1, sessionId1, token1));
            expect(adminQuizSessionResultLink(quizId1 + 1, sessionId1, token1)).toStrictEqual(ERROR403);
        });
        test('Error 403: user is not owner of quiz', () => {
            const token2 = adminAuthRegister(
              VALID_USER_REGISTER_INPUTS_2.EMAIL,
              VALID_USER_REGISTER_INPUTS_2.PASSWORD,
              VALID_USER_REGISTER_INPUTS_2.FIRSTNAME,
              VALID_USER_REGISTER_INPUTS_2.LASTNAME
            ).jsonBody.token;
            console.log(adminQuizSessionResultLink(quizId1, sessionId1, token2));
            expect(adminQuizSessionResultLink(quizId1, sessionId1, token2)).toStrictEqual(ERROR403);
        });
        test('Error 400: session Id does not refer to a valid session within this quiz', () => {
            console.log(quizId1, sessionId1 + 1, token1); 
            console.log(adminQuizSessionResultLink(quizId1, sessionId1 + 1, token1));
            expect(adminQuizSessionResultLink(quizId1, sessionId1 + 1, token1)).toStrictEqual(ERROR400);
        });
        test('Error 400: session is not in FINAL_RESULTS state', () => {
            console.log(quizId1, sessionId1, token1); 
            console.log(adminQuizSessionResultLink(quizId1, sessionId1, token1));
            adminQuizSessionUpdate(quizId1, sessionId1, token1, 'GO_TO_NEXT_QUESTION');
            expect(adminQuizSessionResultLink(quizId1, sessionId1, token1)).toStrictEqual(ERROR400);
        });
    });
    describe('success cases', () => {
        test('Successfully return URL with CSV file', () => {
            adminQuizSessionUpdate(quizId1, sessionId1, token1, 'GO_TO_FINAL_RESULTS');
            const result = adminQuizSessionResultLink(quizId1, sessionId1, token1).jsonBody
            expect(result).toMatch(/https:/);
            expect(result).toMatch(/.csv/);
        });
        test('The final result is transfered to CSV sucessfully', () => {
            adminQuizSessionUpdate(quizId1, sessionId1, token1, 'GO_TO_FINAL_RESULTS');
            const url = adminQuizSessionResultLink(quizId1, sessionId1, token1).jsonBody.url;
            const csvData = getCsvData(url);
            expect(csvData).toStrictEqual('Player,question1score,question1rank\nHayden,0,1\n');
    });
  });
});
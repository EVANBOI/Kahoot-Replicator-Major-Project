import { 
    ERROR401, ERROR403, VALID_USER_REGISTER_INPUTS_1, VALID_QUIZ_CREATE_INPUTS_1, 
    validQuestion1V2, VALID_USER_REGISTER_INPUTS_2, VALID_QUIZ_CREATE_INPUTS_2
} from '../testConstants';
import {
  clear,
  adminAuthRegister,
  adminQuizCreateV2,
  adminQuizSessionUpdate,
  adminQuizSessionStart,
  adminCreateQuizQuestionV2,
  adminQuizSessionView
} from '../wrappers';

let token1: string;
let sessionId1: number, sessionId2: number;
let quizId1: number, quizId2: number;
let questionId1: number, questionId2: number;
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
});


describe('GET /v1/admin/quiz/{quizid}/sessions', () => {
    describe('error cases', () => {
        test('Error 401: token is empty', () => {
            expect(adminQuizSessionView('', quizId1)).toStrictEqual(ERROR401);
        });
        test('Error 401: token is invalid', () => {
            expect(adminQuizSessionView(token1 + 1, quizId1)).toStrictEqual(ERROR401);
        });
        test('Error 403: quiz does not exist', () => {
            expect(adminQuizSessionView(token1, quizId1 + 1)).toStrictEqual(ERROR403);
        });
        test('Error 403: user is not owner of quiz', () => {
            const token2 = adminAuthRegister(
                VALID_USER_REGISTER_INPUTS_2.EMAIL,
                VALID_USER_REGISTER_INPUTS_2.PASSWORD,
                VALID_USER_REGISTER_INPUTS_2.FIRSTNAME,
                VALID_USER_REGISTER_INPUTS_2.LASTNAME
            ).jsonBody.token;
            expect(adminQuizSessionView(token2, quizId1)).toStrictEqual(ERROR403);
        });
    });

    describe('success cases', () => {
        test.failing('Successfully view session with only 1 active session existing', () => {
            adminQuizSessionUpdate(quizId1, sessionId1, token1, "LOBBY");
            expect(adminQuizSessionView(token1, quizId1).jsonBody).toStrictEqual({
                activeSessions: [sessionId1],
                inactiveSessions: []
            });
        });
        test.failing('Successfully view session with only 1 inactive session existing', () => {
            adminQuizSessionUpdate(quizId1, sessionId1, token1, "END");
            expect(adminQuizSessionView(token1, quizId1).jsonBody).toStrictEqual({
                activeSessions: [],
                inactiveSessions: [sessionId1]
            });
        });
        test('Successfully view session with no sessions existing', () => {
            quizId2 = adminQuizCreateV2(
                token1,
                VALID_QUIZ_CREATE_INPUTS_2.NAME,
                VALID_QUIZ_CREATE_INPUTS_2.DESCRIPTION
              ).jsonBody.quizId;
            questionId2 = adminCreateQuizQuestionV2(quizId2, token1, validQuestion1V2).jsonBody.questionId;
            expect(adminQuizSessionView(token1, quizId1).jsonBody).toStrictEqual({
                activeSessions: [],
                inactiveSessions: []
            });
        });
        test.failing('Successfully view session with both active and inactive sessions existing', () => {
            sessionId2 = adminQuizSessionStart(quizId1, token1, 5).jsonBody.sessionId;
            adminQuizSessionUpdate(quizId1, sessionId1, token1, "LOBBY");
            adminQuizSessionUpdate(quizId1, sessionId2, token1, "END");
            expect(adminQuizSessionView(token1, quizId1).jsonBody).toStrictEqual({
                activeSessions: [sessionId1],
                inactiveSessions: [sessionId2]
            });
        });
        test.failing('Successfully view session with multiple active sessions existing', () => {
            sessionId2 = adminQuizSessionStart(quizId1, token1, 5).jsonBody.sessionId;
            adminQuizSessionUpdate(quizId1, sessionId1, token1, "LOBBY");
            adminQuizSessionUpdate(quizId1, sessionId2, token1, "LOBBY");
            expect(adminQuizSessionView(token1, quizId1).jsonBody).toStrictEqual({
                activeSessions: [sessionId1, sessionId2],
                inactiveSessions: []
            });
        });
        test.failing('Successfully view session with multiple inactive sessions existing', () => {
            sessionId2 = adminQuizSessionStart(quizId1, token1, 5).jsonBody.sessionId;
            adminQuizSessionUpdate(quizId1, sessionId1, token1, "END");
            adminQuizSessionUpdate(quizId1, sessionId2, token1, "END");
            expect(adminQuizSessionView(token1, quizId1).jsonBody).toStrictEqual({
                activeSessions: [],
                inactiveSessions: [sessionId1, sessionId2]
            });
        });
    });
})
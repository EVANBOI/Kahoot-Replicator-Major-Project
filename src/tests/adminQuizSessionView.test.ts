import { 
    ERROR401, ERROR403, VALID_USER_REGISTER_INPUTS_1, VALID_QUIZ_CREATE_INPUTS_1, validQuestion1V2
} from '../testConstants';
import {
  clear,
  adminAuthRegister,
  adminQuizCreate,
  adminQuizSessionUpdate,
  adminQuizSessionStart,
  adminCreateQuizQuestionV2,
} from '../wrappers';

let token1: string;
let sessionId1: number;
let quizId1: number;
let questionId1: number;
beforeEach(() => {
    clear();
    token1 = adminAuthRegister(
        VALID_USER_REGISTER_INPUTS_1.EMAIL,
        VALID_USER_REGISTER_INPUTS_1.PASSWORD,
        VALID_USER_REGISTER_INPUTS_1.FIRSTNAME,
        VALID_USER_REGISTER_INPUTS_1.LASTNAME
    ).jsonBody.token;
    quizId1 = adminQuizCreate(
        token1,
        VALID_QUIZ_CREATE_INPUTS_1.NAME,
        VALID_QUIZ_CREATE_INPUTS_1.DESCRIPTION
      ).jsonBody.quizId;
    questionId1 = adminCreateQuizQuestionV2(quizId1, token1, validQuestion1V2).jsonBody.questionId;
    sessionId1 = adminQuizSessionStart(quizId1, token1, 5).jsonBody.sessionId;
  });


describe('GET /v1/admin/quiz/{quizid}/sessions', () => {
    describe('error cases', () => {
        test.todo('Error 401: token is invalid');
        test.todo('Error 401: token is empty');
        test.todo('Error 403: quiz does not exist');
        test.todo('Error 403: user is not owner of quiz');
    });

    describe('success cases', () => {
        test.todo('Successfully view session with only 1 active session existing');
        test.todo('Successfully view session with only 1 inactive session existing');
        test.todo('Successfully view session status with no sessions existing');
        test.todo('Successfully view session status with both active and inactive sessions existing');
    });
})
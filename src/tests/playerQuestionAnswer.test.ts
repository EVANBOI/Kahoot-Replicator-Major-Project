import {
    clear,
    adminAuthRegister,
    adminQuizCreateV2,
    adminCreateQuizQuestionV2,
    adminQuizSessionStart,
    playerJoin,
    playerQuestionAnswer,
    adminQuizSessionUpdate
} from '../wrappers';

import { VALID_USER_REGISTER_INPUTS_1, VALID_USER_REGISTER_INPUTS_2, VALID_QUIZ_CREATE_INPUTS_1, validQuestion1V2 } from '../testConstants';

let token: string;
let token2: string;
let quizId: number;
let sessionId: number;
let questionId: number;
let playerId: number;
let playerId2: number;

beforeEach(() => {
    clear();
    token = adminAuthRegister(
        VALID_USER_REGISTER_INPUTS_1.EMAIL,
        VALID_USER_REGISTER_INPUTS_1.PASSWORD,
        VALID_USER_REGISTER_INPUTS_1.FIRSTNAME,
        VALID_USER_REGISTER_INPUTS_1.LASTNAME
    ).jsonBody.token;
    token2 = adminAuthRegister(
        VALID_USER_REGISTER_INPUTS_2.EMAIL,
        VALID_USER_REGISTER_INPUTS_2.PASSWORD,
        VALID_USER_REGISTER_INPUTS_2.FIRSTNAME,
        VALID_USER_REGISTER_INPUTS_2.LASTNAME
    ).jsonBody.token;
    quizId = adminQuizCreateV2(
        token,
        VALID_QUIZ_CREATE_INPUTS_1.NAME,
        VALID_QUIZ_CREATE_INPUTS_1.DESCRIPTION
    ).jsonBody.quizId;
    questionId = adminCreateQuizQuestionV2(quizId, token, validQuestion1V2).jsonBody.questionId;
    sessionId = adminQuizSessionStart(quizId, token, 5).jsonBody.sessionId;
    playerId = playerJoin(sessionId, 'Player1').jsonBody.playerId;
    playerId2 = playerJoin(sessionId, 'Player2').jsonBody.playerId;
    adminQuizSessionUpdate(quizId, sessionId, token, 'START_QUIZ');
});

describe('Error cases', () => {
    test('Error 400: player ID does not exist', () => {
        adminQuizSessionUpdate(quizId, sessionId, token, 'QUESTION_OPEN');
        const res = playerQuestionAnswer(playerId + 1, 1, [validQuestion1V2.answers[0].answerId]);
        expect(res.statusCode).toBe(400);
    });

    test('Error 400: question position is not valid', () => {
        adminQuizSessionUpdate(quizId, sessionId, token, 'QUESTION_OPEN');
        const res = playerQuestionAnswer(playerId, 2, [validQuestion1V2.answers[0].answerId]);
        expect(res.statusCode).toBe(400);
    });

    test('Error 400: session is not in QUESTION_OPEN state', () => {
        const res = playerQuestionAnswer(playerId, 1, [validQuestion1V2.answers[0].answerId]);
        expect(res.statusCode).toBe(400);
    });

    test('Error 400: session is not currently on this question', () => {
        adminQuizSessionUpdate(quizId, sessionId, token, 'QUESTION_OPEN');
        adminQuizSessionUpdate(quizId, sessionId, token, 'QUESTION_CLOSE');
        const res = playerQuestionAnswer(playerId, 1, [validQuestion1V2.answers[0].answerId]);
        expect(res.statusCode).toBe(400);
    });

    test('Error 400: answer IDs are not valid for this particular question', () => {
        adminQuizSessionUpdate(quizId, sessionId, token, 'QUESTION_OPEN');
        const res = playerQuestionAnswer(playerId, 1, [999]);
        expect(res.statusCode).toBe(400);
    });

    test('Error 400: there are duplicate answer IDs provided', () => {
        adminQuizSessionUpdate(quizId, sessionId, token, 'QUESTION_OPEN');
        const res = playerQuestionAnswer(playerId, 1, [validQuestion1V2.answers[0].answerId, validQuestion1V2.answers[0].answerId]);
        expect(res.statusCode).toBe(400);
    });

    test('Error 400: less than 1 answer ID was submitted', () => {
        adminQuizSessionUpdate(quizId, sessionId, token, 'QUESTION_OPEN');
        const res = playerQuestionAnswer(playerId, 1, []);
        expect(res.statusCode).toBe(400);
    });
});

describe('Success cases', () => {
    test('Success: Successfully submit answer', () => {
        adminQuizSessionUpdate(quizId, sessionId, token, 'QUESTION_OPEN');
        const res = playerQuestionAnswer(playerId, 1, [validQuestion1V2.answers[0].answerId]);
        expect(res.statusCode).toBe(200);
        expect(res.jsonBody).toStrictEqual({});
    });
});

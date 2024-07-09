import { clear, adminQuizTrashEmpty, adminAuthRegister, adminQuizRemove, adminQuizCreate } from '../wrappers';
import { 
    ERROR400, ERROR403, ERROR401, VALID_USER_REGISTER_INPUTS_1, VALID_USER_REGISTER_INPUTS_2, 
    VALID_QUIZ_CREATE_INPUTS_1, INVALID_JSONIFIED_ARRAY_1, INVALID_JSONIFIED_ARRAY_2, QUIZ_TRASH_EMPTYED_SUCCESSFUL
} from '../testConstants';

let VALID_TOKEN: string;
let VALID_QUIZ_ID: number;
let VALID_QUIZ_ID2: number;

beforeEach(() => {
  clear();
});

describe('error tests', () => {
    beforeEach(() => {
        const register = adminAuthRegister(
            VALID_USER_REGISTER_INPUTS_1.EMAIL,
            VALID_USER_REGISTER_INPUTS_1.PASSWORD,
            VALID_USER_REGISTER_INPUTS_1.FIRSTNAME,
            VALID_USER_REGISTER_INPUTS_1.LASTNAME
        );
        VALID_TOKEN = register.jsonBody.token;
        const newQuiz = adminQuizCreate(
            VALID_TOKEN, 
            VALID_QUIZ_CREATE_INPUTS_1.NAME, 
            VALID_QUIZ_CREATE_INPUTS_1.DESCRIPTION
        );
        VALID_QUIZ_ID = newQuiz.jsonBody.quizId;
    });
    describe('ERROR-401', () => {
        test('Token is empty or invalid, with invalid quizIds', () => {
            const INVALID_TOKEN = VALID_TOKEN + 1
            expect(adminQuizTrashEmpty(INVALID_TOKEN, INVALID_JSONIFIED_ARRAY_2)).toStrictEqual(ERROR401);
        });
        test('Token is empty or invalid, with valid quizIds', () => {
            const INVALID_TOKEN = VALID_TOKEN + 1;
            const VALID_JSONIFIED_ARRAY = JSON.parse(`[${VALID_QUIZ_ID}]`);
            adminQuizRemove(VALID_TOKEN, VALID_QUIZ_ID);
            expect(adminQuizTrashEmpty(INVALID_TOKEN, VALID_JSONIFIED_ARRAY)).toStrictEqual(ERROR401);
        });
        test('Token is empty or invalid, with part valid quizIds', () => {
            const INVALID_TOKEN = VALID_TOKEN + 1;
            const PARTIAL_VALID_JSONIFIED_ARRAY = JSON.parse(`[${VALID_QUIZ_ID}, 999]`);
            adminQuizRemove(VALID_TOKEN, VALID_QUIZ_ID);
            expect(adminQuizTrashEmpty(INVALID_TOKEN, PARTIAL_VALID_JSONIFIED_ARRAY)).toStrictEqual(ERROR401);
        });
    });

    describe('ERROR-403', () => {
        let VALID_TOKEN2: string;
        beforeEach(() => {
            const register2 = adminAuthRegister(
                VALID_USER_REGISTER_INPUTS_2.EMAIL,
                VALID_USER_REGISTER_INPUTS_2.PASSWORD,
                VALID_USER_REGISTER_INPUTS_2.FIRSTNAME,
                VALID_USER_REGISTER_INPUTS_2.LASTNAME
            );
            VALID_TOKEN2 = register2.jsonBody.token;
        })

        test('Token valid but some of the quiz does not exsit', () => {
            expect(adminQuizTrashEmpty(VALID_TOKEN, INVALID_JSONIFIED_ARRAY_2)).toStrictEqual(ERROR403);
        });
        test('Token valid but some of the quiz ower does not refers to current user', () => {
            const NOT_ONWER_JSONIFIED_ARRAY = JSON.parse(`[${VALID_QUIZ_ID}]`)
            adminQuizRemove(VALID_TOKEN, VALID_QUIZ_ID);
            expect(adminQuizTrashEmpty(VALID_TOKEN2, NOT_ONWER_JSONIFIED_ARRAY)).toStrictEqual(ERROR403);
        });
        test('Token valid but a quiz ower does not refers to current user, and the other is invalid', () => {
            const NOT_ONWER_AND_INVALID_JSONIFIED_ARRAY = JSON.parse(`[${VALID_QUIZ_ID}, 999]`)
            adminQuizRemove(VALID_TOKEN, VALID_QUIZ_ID);
            expect(adminQuizTrashEmpty(VALID_TOKEN2, NOT_ONWER_AND_INVALID_JSONIFIED_ARRAY)).toStrictEqual(ERROR403);
        });
    })
    describe('ERROR-400', () => {
        test('One of the Quiz IDs(all) is not currently in the trash', () => {
            expect(adminQuizTrashEmpty(VALID_TOKEN, INVALID_JSONIFIED_ARRAY_1)).toStrictEqual(ERROR400);
        });
        test('More of the Quiz IDs(all) is not currently in the trash', () => {
            expect(adminQuizTrashEmpty(VALID_TOKEN, INVALID_JSONIFIED_ARRAY_2)).toStrictEqual(ERROR400);
        });
        test('One of the Quiz IDs(part) is not currently in the trash', () => {
            adminQuizRemove(VALID_TOKEN, VALID_QUIZ_ID);
            const PARTIAL_VALID_JSONIFIED_ARRAY = JSON.parse(`[${VALID_QUIZ_ID}, 999]`);
            expect(adminQuizTrashEmpty(VALID_TOKEN, PARTIAL_VALID_JSONIFIED_ARRAY)).toStrictEqual(ERROR400);
        });
    });
});

describe('successful test', () => {
    beforeEach(() => {
        const register = adminAuthRegister(
            VALID_USER_REGISTER_INPUTS_1.EMAIL,
            VALID_USER_REGISTER_INPUTS_1.PASSWORD,
            VALID_USER_REGISTER_INPUTS_1.FIRSTNAME,
            VALID_USER_REGISTER_INPUTS_1.LASTNAME
        );
        VALID_TOKEN = register.jsonBody.token;
        const newQuiz = adminQuizCreate(
            VALID_TOKEN, 
            VALID_QUIZ_CREATE_INPUTS_1.NAME, 
            VALID_QUIZ_CREATE_INPUTS_1.DESCRIPTION
        );
        VALID_QUIZ_ID = newQuiz.jsonBody.quizId;
        const newQuiz2 = adminQuizCreate(
            VALID_TOKEN, 
            VALID_QUIZ_CREATE_INPUTS_1.NAME, 
            VALID_QUIZ_CREATE_INPUTS_1.DESCRIPTION
        );
        VALID_QUIZ_ID2 = newQuiz2.jsonBody.quizId;
    });
    test('successful return correct value', () => {
        const VALID_JSONIFIED_ARRAY = JSON.parse(`[${VALID_QUIZ_ID}]`);
        adminQuizRemove(VALID_TOKEN, VALID_QUIZ_ID);
        expect(adminQuizTrashEmpty(VALID_TOKEN, VALID_JSONIFIED_ARRAY)).toStrictEqual(QUIZ_TRASH_EMPTYED_SUCCESSFUL);
    });
    
    test('correctly delete 1 quiz trash bin with 1 quiz in there', () => {
        const VALID_JSONIFIED_ARRAY = JSON.parse(`[${VALID_QUIZ_ID}]`);
        adminQuizRemove(VALID_TOKEN, VALID_QUIZ_ID);
        /*
        expect(adminQuizTrashView(VALID_TOKEN)).toStrictEqual({
            statusCode: 200,
            jsonBody: {
                quzzies: [
                    {
                        quizId: VALID_QUIZ_ID,
                        name: expect.any(String)
                    }
                ]
            }
        });
        */
        expect(adminQuizTrashEmpty(VALID_TOKEN, VALID_JSONIFIED_ARRAY)).toStrictEqual(QUIZ_TRASH_EMPTYED_SUCCESSFUL);
        /*
        expect(adminQuizTrashView(VALID_TOKEN)).toStrictEqual({
            statusCode: 200,
            jsonBody: {
                quzzies: []
            }
        });
        */
    });

    test('correctly delete 1 quiz trash bin with 2 quizzes in there', () => {
        adminQuizRemove(VALID_TOKEN, VALID_QUIZ_ID);
        adminQuizRemove(VALID_TOKEN, VALID_QUIZ_ID2);
        /*
        expect(adminQuizTrashView(VALID_TOKEN)).toStrictEqual({
            statusCode: 200,
            jsonBody: {
                quzzies: [
                    {
                        quizId: VALID_QUIZ_ID,
                        name: expect.any(String)
                    },
                    {
                        quizId: VALID_QUIZ_ID2,
                        name: expect.any(String)
                    }
                ]
            }
        });
        */
        const VALID_JSONIFIED_ARRAY = JSON.parse(`[${VALID_QUIZ_ID}]`);
        expect(adminQuizTrashEmpty(VALID_TOKEN, VALID_JSONIFIED_ARRAY)).toStrictEqual(QUIZ_TRASH_EMPTYED_SUCCESSFUL);
        /*
        expect(adminQuizTrashView(VALID_TOKEN)).toStrictEqual({
            statusCode: 200,
            jsonBody: {
                quzzies: [
                    {
                        quizId: VALID_QUIZ_ID2,
                        name: expect.any(String)
                    }
                ]
            }
        });
        */
    });

    test('correctly delete 2 quizzes trash bin with 2 quizes in there', () => {
        adminQuizRemove(VALID_TOKEN, VALID_QUIZ_ID);
        adminQuizRemove(VALID_TOKEN, VALID_QUIZ_ID2);
        /*
        expect(adminQuizTrashView(VALID_TOKEN)).toStrictEqual({
            statusCode: 200,
            jsonBody: {
                quzzies: [
                    {
                        quizId: VALID_QUIZ_ID,
                        name: expect.any(String)
                    },
                    {
                        quizId: VALID_QUIZ_ID2,
                        name: expect.any(String)
                    }
                ]
            }
        });
        */
        const VALID_JSONIFIED_ARRAY = JSON.parse(`[${VALID_QUIZ_ID}, ${VALID_QUIZ_ID2}]`);
        expect(adminQuizTrashEmpty(VALID_TOKEN, VALID_JSONIFIED_ARRAY)).toStrictEqual(QUIZ_TRASH_EMPTYED_SUCCESSFUL);
        /*
        expect(adminQuizTrashView(VALID_TOKEN)).toStrictEqual({
            statusCode: 200,
            jsonBody: {
                quzzies: []
            }
        });
        */
    });
})

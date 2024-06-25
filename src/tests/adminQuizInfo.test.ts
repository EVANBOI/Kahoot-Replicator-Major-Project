import { adminAuthRegister } from '../auth.js';
import { adminQuizCreate, adminQuizInfo } from '../quiz.js';
import { clear } from '../other.js';

const VALID_USER = {
    EMAIL: 'admin@email.com',
    PASSWORD: 'password1',
    FIRSTNAME: 'Idk',
    LASTNAME: 'Idk',
}

const VALID_QUIZ = {
    NAME: 'ValidQuizName', 
    DESCRIPTION: 'ValidDescription'
}

let VALID_USER_ID: number;
let VALID_QUIZ_ID: number;

const ERROR = {
    error: expect.any(String)
}

beforeEach(() => {
    clear();
})

describe('error tests', () => {
    beforeEach(() => {
        VALID_USER_ID = adminAuthRegister(
            VALID_USER.EMAIL, 
            VALID_USER.PASSWORD, 
            VALID_USER.FIRSTNAME, 
            VALID_USER.LASTNAME
        ).authUserId;
    });

    test('AuthUserId is not a valid user.', () => {
        expect(adminQuizInfo(VALID_USER_ID + 1, VALID_QUIZ_ID)).toStrictEqual(ERROR);
    });

    test('QuizId is not a valid quiz.', () => {
        expect(adminQuizInfo(VALID_USER_ID, VALID_QUIZ_ID + 1)).toStrictEqual(ERROR);
    });

    test('Visitor is not creator', () => {
        VALID_QUIZ_ID = adminQuizCreate(VALID_USER_ID, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION).quizId;
        const ANOTHETR_USER_ID = adminAuthRegister(
            'validAnotherEmail@gmail.com', 
            VALID_USER.PASSWORD, 
            VALID_USER.FIRSTNAME, 
            VALID_USER.LASTNAME
        ).authUserId;
        expect(adminQuizInfo(ANOTHETR_USER_ID, VALID_QUIZ_ID)).toStrictEqual(ERROR);
    });
})

describe('success tests', () => {
    beforeEach(() => {
        VALID_USER_ID = adminAuthRegister(
            VALID_USER.EMAIL, 
            VALID_USER.PASSWORD, 
            VALID_USER.FIRSTNAME, 
            VALID_USER.LASTNAME
        ).authUserId;
        VALID_QUIZ_ID = adminQuizCreate(
            VALID_USER_ID, 
            VALID_QUIZ.NAME, 
            VALID_QUIZ.DESCRIPTION
        ).quizId;
    });

    test('correct return value', () => {
        expect(adminQuizInfo(VALID_USER_ID, VALID_QUIZ_ID)).toStrictEqual({
            quizId: VALID_QUIZ_ID,
            name: VALID_QUIZ.NAME,
            timeCreated: expect.any(Number),
            timeLastEdited: expect.any(Number),
            description: VALID_QUIZ.DESCRIPTION,
        });
    });
})
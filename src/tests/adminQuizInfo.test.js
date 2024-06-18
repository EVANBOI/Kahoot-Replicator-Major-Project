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

}

let VALID_USER_ID;
let VALID_QUIZ_ID;

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
        expec(adminQuizInfo(VALID_USER_ID + 1, VALID_QUIZ_ID)).toStrictEqual(ERROR);
    });

    test('Quiz ID does not refer to a valid quiz.', () => {
        expec(adminQuizInfo(VALID_USER_ID, VALID_QUIZ_ID + 1)).toStrictEqual(ERROR);
    });

    test.todo('Quiz ID does not refer to a valid quiz.', () => {
       
    });
})
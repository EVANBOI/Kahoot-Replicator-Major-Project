import { clear } from "../other.js"
import { adminAuthRegister, adminUserDetails } from "../auth.js";

const VALID_USER = {
    EMAIL: 'admin@email.com',
    PASSWORD: 'password1',
    FIRSTNAME: 'Idk',
    LASTNAME: 'Idk',
}

const ERROR = {
    error: expect.any(String)
}


describe('Function clear tests', () => {
    test('correct return value check', () => {
        expect(clear()).toEqual({});
    });

    test('correct clear the user store', () => {
        const VALID_USER_ID = adminAuthRegister(
            VALID_USER.EMAIL, 
            VALID_USER.PASSWORD, 
            VALID_USER.FIRSTNAME, 
            VALID_USER.LASTNAME
        ).authUserId;
        clear();
        expect(adminUserDetails(VALID_USER_ID)).toStrictEqual(ERROR);
    });

    test.todo('correct clear the quiz store', () => {

    })

});


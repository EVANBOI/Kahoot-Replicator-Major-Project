import { adminAuthRegister, adminUserDetailsUpdate } from "../auth.js";
import { clear } from "../other.js";

const VALID_INPUTS_1 = {
    EMAIL: 'admin@email.com',
    PASSWORD: 'password1',
    FIRSTNAME: 'Idk',
    LASTNAME: 'Idk'
}

const VALID_INPUTS_2 = {
    EMAIL: 'user@email.com',
    PASSWORD: 'password1',
    FIRSTNAME: 'Idk',
    LASTNAME: 'Idk'
}

const ERROR = {
    error: expect.any(String)
}

beforeEach(() => {
    clear();
})

describe('error tests', () => {
    const VALID_ID_1 = adminAuthRegister(
        VALID_INPUTS_1.EMAIL, 
        VALID_INPUTS_1.PASSWORD, 
        VALID_INPUTS_1.FIRSTNAME, 
        VALID_INPUTS_1.LASTNAME
    );
    
    const VALID_ID_2 = adminAuthRegister(
        VALID_INPUTS_2.EMAIL, 
        VALID_INPUTS_2.PASSWORD, 
        VALID_INPUTS_2.FIRSTNAME, 
        VALID_INPUTS_2.LASTNAME
    );

    
    const INVALID_ID = VALID_ID_1.authUserId + VALID_ID_2.authUserId;

    test.each([
        { 
            error: 'AuthUserId is not a valid user',
            authUserId: INVALID_ID, 
            email: VALID_INPUTS_1.EMAIL, 
            nameFirst: VALID_INPUTS_1.FIRSTNAME, 
            nameLast: VALID_INPUTS_1.LASTNAME
        }, 
        {
            error: 'Email is currently used by another user',
            authUserId: VALID_ID_1, 
            email: VALID_INPUTS_2.EMAIL, 
            nameFirst: VALID_INPUTS_1.FIRSTNAME, 
            nameLast: VALID_INPUTS_1.LASTNAME
        }, 
        {
            error: 'Email is currently used by another user',
            authUserId: VALID_ID_1, 
            email: VALID_INPUTS_2.EMAIL, 
            nameFirst: VALID_INPUTS_1.FIRSTNAME, 
            nameLast: VALID_INPUTS_1.LASTNAME
        }
    ]) ('error: $error', ({authUserId, email, nameFirst, nameLast}) => {
        expect(adminUserDetailsUpdate(authUserId, email, nameFirst, nameLast)).toStrictEqual(ERROR);
    })

})
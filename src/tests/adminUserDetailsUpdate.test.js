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

const NEW_VALID_EMAIL = 'newValidEmail@gmail.com'

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

    test('AuthUserId is not a valid user', ()=> {
        const INVALID_ID = VALID_ID_1.authUserId + VALID_ID_2.authUserId + 100;
        expect(adminUserDetailsUpdate(
            INVALID_ID, 
            NEW_VALID_EMAIL, 
            VALID_INPUTS_1.FIRSTNAME, 
            VALID_INPUTS_1.LASTNAME)
        ).toStrictEqual(ERROR);
    });
    
    test('Email is currently used by another user', () => {
        expect(adminUserDetailsUpdate(
            VALID_ID_1, 
            VALID_INPUTS_2.EMAIL, 
            VALID_INPUTS_1.FIRSTNAME, 
            VALID_INPUTS_1.LASTNAME)
        ).toStrictEqual(ERROR);
    });

    test('Email is invalid', () => {
        const INVALID_EMAIL = 'INVALIDEMAIL';
        expect(adminUserDetailsUpdate(
            VALID_ID_1, 
            INVALID_EMAIL, 
            VALID_INPUTS_1.FIRSTNAME, 
            VALID_INPUTS_1.LASTNAME)
        ).toStrictEqual(ERROR);
    })

    test('First name has invalid letter', () => {
        const INVALID_FIRSTNAME = '!Invalid*Name'
        expect(adminUserDetailsUpdate(
            VALID_ID_1, 
            NEW_VALID_EMAIL, 
            INVALID_FIRSTNAME, 
            VALID_INPUTS_1.LASTNAME)
        ).toStrictEqual(ERROR);
    })

    test('Last name has invalid letter', () => {
        const INVALID_LASTNAME = '!Invalid*Name'
        expect(adminUserDetailsUpdate(
            VALID_ID_1, 
            NEW_VALID_EMAIL, 
            VALID_INPUTS_1.FIRSTNAME, 
            INVALID_LASTNAME)
        ).toStrictEqual(ERROR);
    })

    test.each([
        {
            error: 'First name too long',
            authUserId: VALID_ID_1, 
            email: NEW_VALID_EMAIL, 
            nameFirst: 'Toooooooooooooooooooooooooolong', 
            nameLast: VALID_INPUTS_1.LASTNAME
        },
        {
            error: 'First name too short',
            authUserId: VALID_ID_1, 
            email: NEW_VALID_EMAIL, 
            nameFirst: 's', 
            nameLast: VALID_INPUTS_1.LASTNAME
        },
        {
            error: 'Last name too long',
            authUserId: VALID_ID_1, 
            email: NEW_VALID_EMAIL, 
            nameFirst: VALID_INPUTS_1.FIRSTNAME, 
            nameLast: 's'
        },
        {
            error: 'Last name too short',
            authUserId: VALID_ID_1, 
            email: NEW_VALID_EMAIL, 
            nameFirst: VALID_INPUTS_1.FIRSTNAME, 
            nameLast: 'Toooooooooooooooooooooooooolong'
        },
    ]) ('$error', ({authUserId, email, nameFirst, nameLast}) => {
        expect(adminUserDetailsUpdate(authUserId, email, nameFirst, nameLast)).toStrictEqual(ERROR);
    })
})

describe('Successful update', () => {
    test('correct return value', () => {
        const VALID_ID_1 = adminAuthRegister(
            VALID_INPUTS_1.EMAIL, 
            VALID_INPUTS_1.PASSWORD, 
            VALID_INPUTS_1.FIRSTNAME, 
            VALID_INPUTS_1.LASTNAME
        );
        expect(adminUserDetailsUpdate(
            VALID_ID_1.authUserId, 
            NEW_VALID_EMAIL, 
            VALID_INPUTS_1.FIRSTNAME, 
            VALID_INPUTS_1.LASTNAME)
        ).toStrictEqual({ });
    })

})


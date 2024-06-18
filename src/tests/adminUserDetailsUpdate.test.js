import { adminAuthRegister, adminUserDetailsUpdate, adminUserDetails } from "../auth.js";
import { clear } from "../other.js";

const VALID_INPUTS_1 = {
    EMAIL: 'admin@email.com',
    PASSWORD: 'password1',
    FIRSTNAME: 'Idk',
    LASTNAME: 'Idk',
}

const VALID_INPUTS_2 = {
    EMAIL: 'user@email.com',
    PASSWORD: 'password1',
    FIRSTNAME: 'Idk',
    LASTNAME: 'Idk',
}

const ERROR = {
    error: expect.any(String)
}

const NEW_VALID_EMAIL = 'newValidEmail@gmail.com'
let VALID_USERID1;

beforeEach(() => {
    clear();
})

describe('error tests', () => {
    beforeEach(() => {
        VALID_USERID1 = adminAuthRegister(
            VALID_INPUTS_1.EMAIL, 
            VALID_INPUTS_1.PASSWORD, 
            VALID_INPUTS_1.FIRSTNAME, 
            VALID_INPUTS_1.LASTNAME
        ).authUserId;
    })


    test('UserId is not a valid user', ()=> {
        const INVALID_ID = VALID_USERID1 + 1;
        expect(adminUserDetailsUpdate(
            INVALID_ID, 
            NEW_VALID_EMAIL, 
            VALID_INPUTS_1.FIRSTNAME, 
            VALID_INPUTS_1.LASTNAME)
        ).toStrictEqual(ERROR);
    });
    
    test('Email is currently used by another user', () => {
        adminAuthRegister(
            VALID_INPUTS_2.EMAIL, 
            VALID_INPUTS_2.PASSWORD, 
            VALID_INPUTS_2.FIRSTNAME, 
            VALID_INPUTS_2.LASTNAME
        );
        expect(adminUserDetailsUpdate(
            VALID_USERID1, 
            VALID_INPUTS_2.EMAIL, 
            VALID_INPUTS_1.FIRSTNAME, 
            VALID_INPUTS_1.LASTNAME)
        ).toStrictEqual(ERROR);
    });

    test('Email is invalid', () => {
        const INVALID_EMAIL = 'INVALIDEMAIL';
        expect(adminUserDetailsUpdate(
            VALID_USERID1, 
            INVALID_EMAIL, 
            VALID_INPUTS_1.FIRSTNAME, 
            VALID_INPUTS_1.LASTNAME)
        ).toStrictEqual(ERROR);
    })

    test('First name has invalid letter', () => {
        const INVALID_FIRSTNAME = '!Invalid*Name'
        expect(adminUserDetailsUpdate(
            VALID_USERID1, 
            NEW_VALID_EMAIL, 
            INVALID_FIRSTNAME, 
            VALID_INPUTS_1.LASTNAME)
        ).toStrictEqual(ERROR);
    })

    test('Last name has invalid letter', () => {
        const INVALID_LASTNAME = '!Invalid*Name'
        expect(adminUserDetailsUpdate(
            VALID_USERID1, 
            NEW_VALID_EMAIL, 
            VALID_INPUTS_1.FIRSTNAME, 
            INVALID_LASTNAME)
        ).toStrictEqual(ERROR);
    })

    test.each([
        {
            error: 'First name too long',
            authUserId: VALID_USERID1, 
            email: NEW_VALID_EMAIL, 
            nameFirst: 'l'.repeat(30), 
            nameLast: VALID_INPUTS_1.LASTNAME
        },
        {
            error: 'First name too short',
            authUserId: VALID_USERID1, 
            email: NEW_VALID_EMAIL, 
            nameFirst: 's', 
            nameLast: VALID_INPUTS_1.LASTNAME
        },
        {
            error: 'Last name too short',
            authUserId: VALID_USERID1, 
            email: NEW_VALID_EMAIL, 
            nameFirst: VALID_INPUTS_1.FIRSTNAME, 
            nameLast: 's'
        },
        {
            error: 'Last name too long',
            authUserId: VALID_USERID1, 
            email: NEW_VALID_EMAIL, 
            nameFirst: VALID_INPUTS_1.FIRSTNAME, 
            nameLast: 'l'.repeat(30)
        },
    ]) ('$error', ({authUserId, email, nameFirst, nameLast}) => {
        expect(adminUserDetailsUpdate(authUserId, email, nameFirst, nameLast)).toStrictEqual(ERROR);
    })
})

describe('Successful update', () => {
    beforeEach(() => {
        VALID_USERID1 = adminAuthRegister(
            VALID_INPUTS_1.EMAIL, 
            VALID_INPUTS_1.PASSWORD, 
            VALID_INPUTS_1.FIRSTNAME, 
            VALID_INPUTS_1.LASTNAME
        ).authUserId;
    })

    test('correct return value', () => {
        expect(adminUserDetailsUpdate(
            VALID_USERID1, 
            NEW_VALID_EMAIL, 
            VALID_INPUTS_1.FIRSTNAME, 
            VALID_INPUTS_1.LASTNAME)
        ).toStrictEqual({ });
    })

    test('correct update First name', () => {
        adminUserDetailsUpdate(VALID_USERID1, VALID_INPUTS_1.EMAIL, 'ValidFN', VALID_INPUTS_1.LASTNAME);
        expect(adminUserDetails(VALID_USERID1)).toStrictEqual({
            user: {
                userId: VALID_USERID1,
                name: `ValidFN ${VALID_INPUTS_1.LASTNAME}`,
                email: VALID_INPUTS_1.EMAIL,
                numSuccessfulLogins: expect.any(Number),
                numFailedPasswordsSinceLastLogin: expect.any(Number),
            }
        });
    })

    test('correct update Last name', () => {
        adminUserDetailsUpdate(VALID_USERID1, VALID_INPUTS_1.EMAIL, VALID_INPUTS_1.FIRSTNAME, 'ValidFN');
        expect(adminUserDetails(VALID_USERID1)).toStrictEqual({
            user: {
                userId: VALID_USERID1,
                name: `${VALID_INPUTS_1.FIRSTNAME} ValidFN`,
                email: VALID_INPUTS_1.EMAIL,
                numSuccessfulLogins: expect.any(Number),
                numFailedPasswordsSinceLastLogin: expect.any(Number),
            }
        });
    })

    test('correct update New email', () => {
        adminUserDetailsUpdate(VALID_USERID1, NEW_VALID_EMAIL, VALID_INPUTS_1.FIRSTNAME, VALID_INPUTS_1.LASTNAME);
        expect(adminUserDetails(VALID_USERID1)).toStrictEqual({
            user: {
                userId: VALID_USERID1,
                name: `${VALID_INPUTS_1.FIRSTNAME} ${VALID_INPUTS_1.LASTNAME}`,
                email: NEW_VALID_EMAIL,
                numSuccessfulLogins: expect.any(Number),
                numFailedPasswordsSinceLastLogin: expect.any(Number),
            }
        });
    })

    test('correct runing but still be old email', () => {
        adminUserDetailsUpdate(VALID_USERID1, VALID_INPUTS_1.EMAIL, VALID_INPUTS_1.FIRSTNAME, VALID_INPUTS_1.LASTNAME);
        expect(adminUserDetails(VALID_USERID1)).toStrictEqual({
            user: {
                userId: VALID_USERID1,
                name: `${VALID_INPUTS_1.FIRSTNAME} ${VALID_INPUTS_1.LASTNAME}`,
                email: VALID_INPUTS_1.EMAIL,
                numSuccessfulLogins: expect.any(Number),
                numFailedPasswordsSinceLastLogin: expect.any(Number),
            }
        });
    })

})


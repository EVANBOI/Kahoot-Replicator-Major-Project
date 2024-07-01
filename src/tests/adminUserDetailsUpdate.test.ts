import { adminAuthRegister, adminUserDetailsUpdate, adminUserDetails } from "../auth";
import { clear } from "../other";
import { AuthUserIdObject } from "../types"
import request from 'sync-request-curl';
import config from '../config.json';

const port = config.port;
const url = config.url;
const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

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
let VALID_TOKEN: number;

beforeEach(() => {
    request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
})

describe('error tests', () => {
    beforeEach(() => {
        const userRegiserRes = request(
            'POST', 
            SERVER_URL + '/v1/admin/auth/register', 
            {
                json: {
                    email: VALID_INPUTS_1.EMAIL,
                    password: VALID_INPUTS_1.PASSWORD,
                    nameFirst: VALID_INPUTS_1.FIRSTNAME,
                    nameLast: VALID_INPUTS_1.LASTNAME
                },
                timeout: TIMEOUT_MS
            }
        )  
        VALID_TOKEN = JSON.parse(userRegiserRes.body.toString()).authUserId;
    })


    test('Token is not valid', ()=> {
        const INVALID_TOKEN = VALID_TOKEN + 1;
        const detailUpdateRes = request(
            'PUT',
            SERVER_URL + '/v1/admin/user/details',
            {
                json: {
                    authUserId: INVALID_TOKEN, // key should change to sth like token/sessionID after meeting
                    email: NEW_VALID_EMAIL,
                    nameFirst: VALID_INPUTS_1.FIRSTNAME,
                    nameLast: VALID_INPUTS_1.LASTNAME
                },
                timeout: TIMEOUT_MS
            }
        )
        expect(JSON.parse(detailUpdateRes.body.toString())).toStrictEqual(ERROR);
        expect(detailUpdateRes.statusCode).toStrictEqual(401)
    });
    
    test('Email is currently used by another user', () => {
        const userRegiserRes = request(
            'POST', 
            SERVER_URL + '/v1/admin/auth/register', 
            {
                json: {
                    email: VALID_INPUTS_2.EMAIL,
                    password: VALID_INPUTS_2.PASSWORD,
                    nameFirst: VALID_INPUTS_2.FIRSTNAME,
                    nameLast: VALID_INPUTS_2.LASTNAME
                },
                timeout: TIMEOUT_MS
            }
        )  

        adminAuthRegister(
            VALID_INPUTS_2.EMAIL, 
            VALID_INPUTS_2.PASSWORD, 
            VALID_INPUTS_2.FIRSTNAME, 
            VALID_INPUTS_2.LASTNAME
        );
        expect(adminUserDetailsUpdate(
            VALID_TOKEN, 
            VALID_INPUTS_2.EMAIL, 
            VALID_INPUTS_1.FIRSTNAME, 
            VALID_INPUTS_1.LASTNAME)
        ).toStrictEqual(ERROR);
    });

    test('Email is invalid', () => {
        const INVALID_EMAIL = 'INVALIDEMAIL';
        expect(adminUserDetailsUpdate(
            VALID_TOKEN, 
            INVALID_EMAIL, 
            VALID_INPUTS_1.FIRSTNAME, 
            VALID_INPUTS_1.LASTNAME)
        ).toStrictEqual(ERROR);
    })

    test('First name has invalid letter', () => {
        const INVALID_FIRSTNAME = '!Invalid*Name'
        expect(adminUserDetailsUpdate(
            VALID_TOKEN, 
            NEW_VALID_EMAIL, 
            INVALID_FIRSTNAME, 
            VALID_INPUTS_1.LASTNAME)
        ).toStrictEqual(ERROR);
    })

    test('Last name has invalid letter', () => {
        const INVALID_LASTNAME = '!Invalid*Name'
        expect(adminUserDetailsUpdate(
            VALID_TOKEN, 
            NEW_VALID_EMAIL, 
            VALID_INPUTS_1.FIRSTNAME, 
            INVALID_LASTNAME)
        ).toStrictEqual(ERROR);
    })

    test.each([
        {
            error: 'First name too long',
            authUserId: VALID_TOKEN, 
            email: NEW_VALID_EMAIL, 
            nameFirst: 'l'.repeat(30), 
            nameLast: VALID_INPUTS_1.LASTNAME
        },
        {
            error: 'First name too short',
            authUserId: VALID_TOKEN, 
            email: NEW_VALID_EMAIL, 
            nameFirst: 's', 
            nameLast: VALID_INPUTS_1.LASTNAME
        },
        {
            error: 'Last name too short',
            authUserId: VALID_TOKEN, 
            email: NEW_VALID_EMAIL, 
            nameFirst: VALID_INPUTS_1.FIRSTNAME, 
            nameLast: 's'
        },
        {
            error: 'Last name too long',
            authUserId: VALID_TOKEN, 
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
        const register = adminAuthRegister(
            VALID_INPUTS_1.EMAIL, 
            VALID_INPUTS_1.PASSWORD, 
            VALID_INPUTS_1.FIRSTNAME, 
            VALID_INPUTS_1.LASTNAME
        ) as AuthUserIdObject
        VALID_TOKEN = register.authUserId;
    })

    test('correct return value', () => {
        expect(adminUserDetailsUpdate(
            VALID_TOKEN, 
            NEW_VALID_EMAIL, 
            VALID_INPUTS_1.FIRSTNAME, 
            VALID_INPUTS_1.LASTNAME)
        ).toStrictEqual({ });
    })

    test('correct update First name with all valid letters', () => {
        adminUserDetailsUpdate(VALID_TOKEN, VALID_INPUTS_1.EMAIL, "ValidFN-' ", VALID_INPUTS_1.LASTNAME);
        expect(adminUserDetails(VALID_TOKEN)).toStrictEqual({
            user: {
                userId: VALID_TOKEN,
                name: `ValidFN-'  ${VALID_INPUTS_1.LASTNAME}`,
                email: VALID_INPUTS_1.EMAIL,
                numSuccessfulLogins: expect.any(Number),
                numFailedPasswordsSinceLastLogin: expect.any(Number),
            }
        });
    })

    test('correct update Last name with all valid letters', () => {
        adminUserDetailsUpdate(VALID_TOKEN, VALID_INPUTS_1.EMAIL, VALID_INPUTS_1.FIRSTNAME, "ValidFN-' ");
        expect(adminUserDetails(VALID_TOKEN)).toStrictEqual({
            user: {
                userId: VALID_TOKEN,
                name: `${VALID_INPUTS_1.FIRSTNAME} ValidFN-' `,
                email: VALID_INPUTS_1.EMAIL,
                numSuccessfulLogins: expect.any(Number),
                numFailedPasswordsSinceLastLogin: expect.any(Number),
            }
        });
    })

    test('correct update New email', () => {
        adminUserDetailsUpdate(VALID_TOKEN, NEW_VALID_EMAIL, VALID_INPUTS_1.FIRSTNAME, VALID_INPUTS_1.LASTNAME);
        expect(adminUserDetails(VALID_TOKEN)).toStrictEqual({
            user: {
                userId: VALID_TOKEN,
                name: `${VALID_INPUTS_1.FIRSTNAME} ${VALID_INPUTS_1.LASTNAME}`,
                email: NEW_VALID_EMAIL,
                numSuccessfulLogins: expect.any(Number),
                numFailedPasswordsSinceLastLogin: expect.any(Number),
            }
        });
    })

    test('correct runing but still be old email', () => {
        adminUserDetailsUpdate(VALID_TOKEN, VALID_INPUTS_1.EMAIL, VALID_INPUTS_1.FIRSTNAME, VALID_INPUTS_1.LASTNAME);
        expect(adminUserDetails(VALID_TOKEN)).toStrictEqual({
            user: {
                userId: VALID_TOKEN,
                name: `${VALID_INPUTS_1.FIRSTNAME} ${VALID_INPUTS_1.LASTNAME}`,
                email: VALID_INPUTS_1.EMAIL,
                numSuccessfulLogins: expect.any(Number),
                numFailedPasswordsSinceLastLogin: expect.any(Number),
            }
        });
    })

})


import { adminAuthRegister, adminAuthLogout, clear } from '../wrappers'

const ERROR = {
    statusCode: 401,
    jsonBody: { error: expect.any(String) }
}

const LOGOUT_SUCCESSFUL = {
    statusCode: 200,
    jsonBody: {}
}

let sessionId: string;
beforeEach(() => {
    clear();
    const { jsonBody: body } = adminAuthRegister(
        'admin1@ad.unsw.edu.au', 'Paswoor34', 'JJ', 'ZZ');
    sessionId = body?.sessionId;
});

describe('Failure cases', () => {
    test('Session id is empty', () => {
        expect(adminAuthLogout('')).toStrictEqual(ERROR);
    })
    test('Session Id does not exist', () => {
        expect(adminAuthLogout('-10000')).toStrictEqual(ERROR);
    })
    
})

describe('Success cases', () => {
    describe('Only one user exists in database', () => {
        test('Check if it returns an empty object', () => {
            expect(adminAuthLogout(sessionId)).toStrictEqual(LOGOUT_SUCCESSFUL);
        })
        test('Successful logout of one user', () => {
            adminAuthLogout(sessionId);
            expect(adminAuthLogout(sessionId)).toStrictEqual(ERROR);
        })
    })

    describe('There are multiple users in database', () => {
        let sessionId2: string, sessionId3: string;
        beforeEach(() => {
            const { jsonBody: body2 } = adminAuthRegister(
                'admin2@ad.unsw.edu.au', 'Paswoor34', 'JJ', 'ZZ');
            sessionId2 = body2?.sessionId;
            const { jsonBody: body3 } = adminAuthRegister(
                'admin3@ad.unsw.edu.au', 'Paswoor34', 'JJ', 'ZZ');
            sessionId3 = body3?.sessionId;
        })
        test('Successful logout of one user', () => {
            expect(adminAuthLogout(sessionId2)).toStrictEqual({
                statusCode: 200,
                jsonBody: {}
            });
        });
        test('Successful logout of multiple users', () => {
            adminAuthLogout(sessionId);
            adminAuthLogout(sessionId2);
            expect(adminAuthLogout(sessionId3)).toStrictEqual(LOGOUT_SUCCESSFUL);
        });
    })
})

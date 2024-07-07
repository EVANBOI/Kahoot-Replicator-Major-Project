import { adminUserDetails } from '../auth';
import { adminAuthRegister, adminAuthLogout, clear } from '../wrappers'

const ERROR = {
    statusCode: 401,
    jsonBody: { error: expect.any(String) }
}

beforeEach(() => {
    clear();
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
    let sessionId1: string;
    beforeEach(() => {
        const { jsonBody } = adminAuthRegister(
            'admin1@ad.unsw.edu.au', 'Paswoor34', 'JJ', 'ZZ');
        sessionId1 = jsonBody?.sessionId;
    })
    describe('Only one user exists in database', () => {
        test('Check if it returns an empty object', () => {
            expect(adminAuthLogout(sessionId1)).toStrictEqual({
                statusCode: 200,
                jsonBody: {}
            });
        })
        test('Successful logout of one user', () => {
            adminAuthLogout(sessionId1);
            expect(adminAuthLogout(sessionId1)).toStrictEqual(ERROR);
        })
    })

    describe('There are multiple users in database', () => {
        let sessionId2: string, sessionId3: string;
        beforeEach(() => {
            const { jsonBody } = adminAuthRegister(
                'admin2@ad.unsw.edu.au', 'Paswoor34', 'JJ', 'ZZ');
            sessionId2 = jsonBody?.sessionId;
        })
        test('Successful logout of one user', () => {
            expect(adminAuthLogout(sessionId2)).toStrictEqual({
                statusCode: 200,
                jsonBody: {}
            });
        });
        test.todo('Successful logout of multiple users');
    })
    
})

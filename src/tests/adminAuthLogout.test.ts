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
    let sessionId: string;
    beforeEach(() => {
        const { jsonBody } = adminAuthRegister(
            'admin1@ad.unsw.edu.au', 'Paswoor34', 'JJ', 'ZZ');
        sessionId = jsonBody?.sessionId;
    })
    test('Check if it returns an empty object', () => {
        expect(adminAuthLogout);
    })

    describe('Only one user exists in database', () => {
        test.todo('Successful logout of one user')
    })

    describe('There are multiple users in database', () => {
        test.todo('Successful logout of one user');
        test.todo('Successful logout of multiple users');
    })
    
})

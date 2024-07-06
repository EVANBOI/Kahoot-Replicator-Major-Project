import { adminAuthRegister, adminAuthLogout } from '../wrappers'
import { clear } from '../other'

const ERROR = {
    statusCode: 401,
    jsonBody: { error: expect.any(String) }
}

beforeEach(() => {
    clear();
});

describe('Failure cases', () => {
    test.todo('Session id is empty')
    test.todo('Session Id does not exist')
    
})

describe('Success cases', () => {
    test.todo('Check if it returns an empty object')

    describe('Only one user exists in database', () => {
        test.todo('Successful logout of one user')
    })

    describe('There are multiple users in database', () => {
        test.todo('Successful logout of one user');
        test.todo('Successful logout of multiple users');
    })
    
})

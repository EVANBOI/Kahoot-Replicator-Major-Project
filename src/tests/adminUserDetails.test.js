import { adminAuthRegister, adminAuthLogin, adminUserDetails } from '../auth.js';
import {clear} from '../other.js';

// Clear the state before each test
beforeEach(() => {
    clear();
});

test('should return user details for a valid authUserId', () => {
    // Register a user to set up the initial state
    const registerResponse = adminAuthRegister('test.email@domain.com', 'password123', 'Hayden', 'Smith');
    console.log('Register Response:', registerResponse);
    
    const authUserId = registerResponse;
    console.log('authUserID:', authUserId);
    const result = adminUserDetails(registerResponse);
    console.log('blahblhablhablhablha',adminUserDetails(1));
    console.log('User Details Result:', result);

    expect(result).toEqual({
        user: {
            userId: authUserId,
            name: 'Hayden Smith',
            email: 'test.email@domain.com',
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0,
        }
    });
});

test('should return an error for an invalid authUserId', () => {
    const invalidAuthUserId = -1;
    const result = adminUserDetails(invalidAuthUserId);
    console.log('Invalid User Details Result:', result);
    expect(result).toStrictEqual({ error: expect.any(String) });
});
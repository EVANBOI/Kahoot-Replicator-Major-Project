import {clear} from '../other.js';
import { adminUserPasswordUpdate,adminAuthRegister,adminAuthLogin} from '../auth.js';

const VALID_NEW_PASSWORD = 'newPassword123';
const SHORT_PASSWORD = 'short';
const NO_NUMBER_PASSWORD = 'password';
const NO_LETTER_PASSWORD = '12345678';

let userId;

beforeEach(() => {
    clear();
});

describe('adminUserPasswordUpdate tests', () => {
    beforeEach(() => {
        const user = adminAuthRegister('chang.li@unsw.edu.au', 'oldPassword1', 'Chang', 'Li');
        userId = user.authUserId;
    });

    test('Successful password update', () => {
        const result = adminUserPasswordUpdate(userId, 'oldPassword1', VALID_NEW_PASSWORD);
        expect(result).toEqual({});
        const userDetails = adminUserDetails(userId);
        expect(userDetails.user.password).toEqual(VALID_NEW_PASSWORD);  // Ensure the password has been updated
    });

    test('Invalid user ID', () => {
        const result = adminUserPasswordUpdate(999, 'anyPassword', VALID_NEW_PASSWORD);
        expect(result).toEqual({ error: expect.any(String) });
    });

    test('Incorrect old password', () => {
        const result = adminUserPasswordUpdate(userId, 'wrongPassword', VALID_NEW_PASSWORD);
        expect(result).toEqual({ error: expect.any(String) });
    });

    test('Old and new password are the same', () => {
        const result = adminUserPasswordUpdate(userId, 'oldPassword1', 'oldPassword1');
        expect(result).toEqual({ error: expect.any(String) });
    });

    test('New password has already been used - check return value', () => {
        adminUserPasswordUpdate(userId, 'oldPassword1', VALID_NEW_PASSWORD);
        const result = adminUserPasswordUpdate(userId, VALID_NEW_PASSWORD, VALID_NEW_PASSWORD);
        expect(result).toEqual({ error: expect.any(String) });
    });

    test('New password has already been used - check data store', () => {
        adminUserPasswordUpdate(userId, 'oldPassword1', VALID_NEW_PASSWORD);
        const result = adminUserPasswordUpdate(userId, VALID_NEW_PASSWORD, 'anotherNewPassword123');
        expect(result).toEqual({});
        const secondResult = adminUserPasswordUpdate(userId, 'anotherNewPassword123', VALID_NEW_PASSWORD);
        expect(secondResult).toEqual({ error: expect.any(String) });
    });

    describe('Password validation tests', () => {
        test.each([
            { testName: 'Password is too short', password: SHORT_PASSWORD, error: expect.any(String) },
            { testName: 'Password with only letters', password: NO_NUMBER_PASSWORD, error: expect.any(String) },
            { testName: 'Password with only numbers', password: NO_LETTER_PASSWORD, error: expect.any(String) }
        ])('Test $testName', ({ password, error }) => {
            const result = adminUserPasswordUpdate(userId, 'oldPassword1', password);
            expect(result).toEqual({ error });
        });
    });
});

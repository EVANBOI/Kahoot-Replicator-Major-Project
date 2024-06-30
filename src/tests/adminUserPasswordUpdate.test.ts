<<<<<<< HEAD:src/tests/adminUserPasswordUpdate.test.ts
import { clear } from '../other';
import { adminUserPasswordUpdate, adminAuthRegister, adminAuthLogin } from '../auth';
import { PasswordUpdateResult } from '../types';
=======
import { clear } from '../other.js';
import { adminUserPasswordUpdate, adminAuthRegister, adminAuthLogin } from '../auth.js';
>>>>>>> master:src/tests/adminUserPasswordUpdate.test.js

const VALID_NEW_PASSWORD = 'newPassword123';
const SHORT_PASSWORD = 'short';
const NO_NUMBER_PASSWORD = 'password';
const NO_LETTER_PASSWORD = '12345678';

let userId: number;

beforeEach(() => {
  clear();
});

describe('adminUserPasswordUpdate tests', () => {
  beforeEach(() => {
    const user = adminAuthRegister('chang.li@unsw.edu.au', 'oldPassword1', 'Chang', 'Li');
    userId = user.authUserId;
  });

<<<<<<< HEAD:src/tests/adminUserPasswordUpdate.test.ts
    test('correct return value', () => {
        const result: PasswordUpdateResult = adminUserPasswordUpdate(userId, 'oldPassword1', VALID_NEW_PASSWORD);
        expect(result).toEqual({});
    });

    test('Invalid user ID', () => {
        const result: PasswordUpdateResult = adminUserPasswordUpdate(999, 'anyPassword', VALID_NEW_PASSWORD);
        expect(result).toEqual({ error: 'AuthUserId is not a valid user.' });
    });

    test('Incorrect old password', () => {
        const result: PasswordUpdateResult = adminUserPasswordUpdate(userId, 'wrongPassword', VALID_NEW_PASSWORD);
        expect(result).toEqual({ error: 'Old Password is not the correct old password' });
    });

    test('Old and new password are the same', () => {
        const result: PasswordUpdateResult = adminUserPasswordUpdate(userId, 'oldPassword1', 'oldPassword1');
        expect(result).toEqual({ error: 'Old Password and New Password match exactly' });
    });

    test('New password has already been used - check return value', () => {
        adminUserPasswordUpdate(userId, 'oldPassword1', VALID_NEW_PASSWORD);
        const result: PasswordUpdateResult = adminUserPasswordUpdate(userId, VALID_NEW_PASSWORD, VALID_NEW_PASSWORD);
        expect(result).toEqual({ error: 'New Password has already been used before by this user' });
    });
=======
  test('correct return value', () => {
    const result = adminUserPasswordUpdate(userId, 'oldPassword1', VALID_NEW_PASSWORD);
    expect(result).toEqual({});
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
>>>>>>> master:src/tests/adminUserPasswordUpdate.test.js

  test('New password has already been used - check data store', () => {
    adminUserPasswordUpdate(userId, 'oldPassword1', VALID_NEW_PASSWORD);
    adminUserPasswordUpdate(userId, VALID_NEW_PASSWORD, 'anotherNewPassword123');
    const loginResult = adminAuthLogin('chang.li@unsw.edu.au', 'anotherNewPassword123');
    expect(loginResult.authUserId).toEqual(userId);
  });

<<<<<<< HEAD:src/tests/adminUserPasswordUpdate.test.ts
    describe('Password validation tests', () => {
        test.each([
            { testName: 'Password is too short', password: SHORT_PASSWORD, error: 'Password should be more than 8 characters' },
            { testName: 'Password with only letters', password: NO_NUMBER_PASSWORD, error: 'Password needs to contain at least one number and at least one letter' },
            { testName: 'Password with only numbers', password: NO_LETTER_PASSWORD, error: 'Password needs to contain at least one number and at least one letter' }
        ])('Test $testName', ({ password, error }) => {
            const result: PasswordUpdateResult = adminUserPasswordUpdate(userId, 'oldPassword1', password);
            expect(result).toEqual({ error });
        });
=======
  describe('Password validation tests', () => {
    test.each([
      { testName: 'Password is too short', password: SHORT_PASSWORD, error: expect.any(String) },
      { testName: 'Password with only letters', password: NO_NUMBER_PASSWORD, error: expect.any(String) },
      { testName: 'Password with only numbers', password: NO_LETTER_PASSWORD, error: expect.any(String) }
    ])('Test $testName', ({ password, error }) => {
      const result = adminUserPasswordUpdate(userId, 'oldPassword1', password);
      expect(result).toEqual({ error });
>>>>>>> master:src/tests/adminUserPasswordUpdate.test.js
    });
  });
});

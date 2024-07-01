import { clear } from '../other';
import { adminUserPasswordUpdate, adminAuthRegister, adminAuthLogin } from '../auth';
import { PasswordUpdateResult, AuthUserIdObject, ErrorMessage } from '../types';

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
    const user = adminAuthRegister('chang.li@unsw.edu.au', 'oldPassword1', 'Chang', 'Li') as AuthUserIdObject;
    userId = user.authUserId;
  });

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
    const firstUpdateResult = adminUserPasswordUpdate(userId, 'oldPassword1', VALID_NEW_PASSWORD);
    expect(firstUpdateResult).toEqual({});

    const secondUpdateResult: PasswordUpdateResult = adminUserPasswordUpdate(userId, VALID_NEW_PASSWORD, 'anotherNewPassword123');
    expect(secondUpdateResult).toEqual({});

    const thirdUpdateResult: PasswordUpdateResult = adminUserPasswordUpdate(userId, 'anotherNewPassword123', VALID_NEW_PASSWORD);
    expect(thirdUpdateResult).toEqual({ error: 'New Password has already been used before by this user' });
  });

  test('New password has already been used - check data store', () => {
    const firstUpdateResult = adminUserPasswordUpdate(userId, 'oldPassword1', VALID_NEW_PASSWORD);
    expect(firstUpdateResult).toEqual({});

    const secondUpdateResult = adminUserPasswordUpdate(userId, VALID_NEW_PASSWORD, 'anotherNewPassword123');
    expect(secondUpdateResult).toEqual({});

    const loginResult = adminAuthLogin('chang.li@unsw.edu.au', 'anotherNewPassword123') as AuthUserIdObject | ErrorMessage;
    if ('error' in loginResult) {
      throw new Error(loginResult.error);
    }
    expect(loginResult.authUserId).toEqual(userId);
  });

  describe('Password validation tests', () => {
    test.each([
      { testName: 'Password is too short', password: SHORT_PASSWORD, error: 'Password should be more than 8 characters' },
      { testName: 'Password with only letters', password: NO_NUMBER_PASSWORD, error: 'Password needs to contain at least one number and at least one letter' },
      { testName: 'Password with only numbers', password: NO_LETTER_PASSWORD, error: 'Password needs to contain at least one number and at least one letter' }
    ])('Test $testName', ({ password, error }) => {
      const result: PasswordUpdateResult = adminUserPasswordUpdate(userId, 'oldPassword1', password);
      expect(result).toEqual({ error });
    });
  });
});

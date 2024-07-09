import { clear } from '../other';
import { adminUserPasswordUpdate, adminAuthRegister } from '../auth';
import { PasswordUpdateResult, SessionIdObject } from '../types';

const VALID_NEW_PASSWORD = 'newPassword123';
const SHORT_PASSWORD = 'short';
const NO_NUMBER_PASSWORD = 'password';
const NO_LETTER_PASSWORD = '12345678';

let sessionId: string;

beforeEach(() => {
  clear();
});

describe('adminUserPasswordUpdate tests', () => {
  beforeEach(() => {
    const user = adminAuthRegister('chang.li@unsw.edu.au', 'oldPassword1', 'Chang', 'Li') as SessionIdObject;
    sessionId = user.token;
  });

  test('correct return value', () => {
    const result: PasswordUpdateResult = adminUserPasswordUpdate(sessionId, 'oldPassword1', VALID_NEW_PASSWORD);
    expect(result).toEqual({});
  });

  test('Invalid session ID', () => {
    const result: PasswordUpdateResult = adminUserPasswordUpdate('invalidSessionId', 'anyPassword', VALID_NEW_PASSWORD);
    expect(result).toEqual({ error: 'sessionId is not valid.' });
  });

  test('Incorrect old password', () => {
    const result: PasswordUpdateResult = adminUserPasswordUpdate(sessionId, 'wrongPassword', VALID_NEW_PASSWORD);
    expect(result).toEqual({ error: 'Old Password is not the correct old password' });
  });

  test('Old and new password are the same', () => {
    const result: PasswordUpdateResult = adminUserPasswordUpdate(sessionId, 'oldPassword1', 'oldPassword1');
    expect(result).toEqual({ error: 'Old Password and New Password match exactly' });
  });

  test('New password has already been used - check return value', () => {
    const firstUpdateResult = adminUserPasswordUpdate(sessionId, 'oldPassword1', VALID_NEW_PASSWORD);
    expect(firstUpdateResult).toEqual({});

    const secondUpdateResult: PasswordUpdateResult = adminUserPasswordUpdate(sessionId, VALID_NEW_PASSWORD, 'anotherNewPassword123');
    expect(secondUpdateResult).toEqual({});

    const thirdUpdateResult: PasswordUpdateResult = adminUserPasswordUpdate(sessionId, 'anotherNewPassword123', VALID_NEW_PASSWORD);
    expect(thirdUpdateResult).toEqual({ error: 'New Password has already been used before by this user' });
  });

  test('New password has already been used - check data store', () => {
    const firstUpdateResult = adminUserPasswordUpdate(sessionId, 'oldPassword1', VALID_NEW_PASSWORD);
    expect(firstUpdateResult).toEqual({});

    const secondUpdateResult = adminUserPasswordUpdate(sessionId, VALID_NEW_PASSWORD, VALID_NEW_PASSWORD);
    expect(secondUpdateResult).toEqual({ error: expect.any(String) });

    // const loginResult = adminAuthLogin('chang.li@unsw.edu.au', 'anotherNewPassword123') as SessionIdObject;
    // expect(loginResult.sessionId).toEqual({ error: expect.any(String) });
  });

  describe('Password validation tests', () => {
    test.each([
      { testName: 'Password is too short', password: SHORT_PASSWORD, error: 'Password should be more than 8 characters' },
      { testName: 'Password with only letters', password: NO_NUMBER_PASSWORD, error: 'Password needs to contain at least one number and at least one letter' },
      { testName: 'Password with only numbers', password: NO_LETTER_PASSWORD, error: 'Password needs to contain at least one number and at least one letter' }
    ])('Test $testName', ({ password, error }) => {
      const result: PasswordUpdateResult = adminUserPasswordUpdate(sessionId, 'oldPassword1', password);
      expect(result).toEqual({ error: expect.any(String) });
    });
  });
});

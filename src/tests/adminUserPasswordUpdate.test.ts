import { clear } from '../other';
import { adminUserPasswordUpdate, adminAuthRegister, adminAuthLogin } from '../wrappers';
import { PasswordUpdateResult, SessionIdObject } from '../types';
import { RequestHelperReturnType } from '../wrappers';  

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
    const user = adminAuthRegister('chang.li@unsw.edu.au', 'oldPassword1', 'Chang', 'Li') as RequestHelperReturnType;
    sessionId = user.jsonBody!.sessionId!;
  });

  test('correct return value', () => {
    const result = adminUserPasswordUpdate(sessionId, 'oldPassword1', VALID_NEW_PASSWORD) as RequestHelperReturnType;
    expect(result.statusCode).toBe(200);
    expect(result.jsonBody).toEqual({});
  });

  test('Invalid session ID', () => {
    const result = adminUserPasswordUpdate('invalidSessionId', 'anyPassword', VALID_NEW_PASSWORD) as RequestHelperReturnType;
    expect(result.statusCode).toBe(400);
    expect(result.jsonBody).toEqual({ error: 'sessionId is not valid.' });
  });

  test('Incorrect old password', () => {
    const result = adminUserPasswordUpdate(sessionId, 'wrongPassword', VALID_NEW_PASSWORD) as RequestHelperReturnType;
    expect(result.statusCode).toBe(400);
    expect(result.jsonBody).toEqual({ error: 'Old Password is not the correct old password' });
  });

  test('Old and new password are the same', () => {
    const result = adminUserPasswordUpdate(sessionId, 'oldPassword1', 'oldPassword1') as RequestHelperReturnType;
    expect(result.statusCode).toBe(400);
    expect(result.jsonBody).toEqual({ error: 'Old Password and New Password match exactly' });
  });

  test('New password has already been used - check return value', () => {
    const firstUpdateResult = adminUserPasswordUpdate(sessionId, 'oldPassword1', VALID_NEW_PASSWORD) as RequestHelperReturnType;
    expect(firstUpdateResult.statusCode).toBe(200);
    expect(firstUpdateResult.jsonBody).toEqual({});

    const secondUpdateResult = adminUserPasswordUpdate(sessionId, VALID_NEW_PASSWORD, 'anotherNewPassword123') as RequestHelperReturnType;
    expect(secondUpdateResult.statusCode).toBe(200);
    expect(secondUpdateResult.jsonBody).toEqual({});

    const thirdUpdateResult = adminUserPasswordUpdate(sessionId, 'anotherNewPassword123', VALID_NEW_PASSWORD) as RequestHelperReturnType;
    expect(thirdUpdateResult.statusCode).toBe(400);
    expect(thirdUpdateResult.jsonBody).toEqual({ error: 'New Password has already been used before by this user' });
  });

  test('New password has already been used - check data store', () => {
    const firstUpdateResult = adminUserPasswordUpdate(sessionId, 'oldPassword1', VALID_NEW_PASSWORD) as RequestHelperReturnType;
    expect(firstUpdateResult.statusCode).toBe(200);
    expect(firstUpdateResult.jsonBody).toEqual({});

    const secondUpdateResult = adminUserPasswordUpdate(sessionId, VALID_NEW_PASSWORD, VALID_NEW_PASSWORD) as RequestHelperReturnType;
    expect(secondUpdateResult.statusCode).toBe(400);
    expect(secondUpdateResult.jsonBody).toEqual({ error: expect.any(String) });

    const loginResult = adminAuthLogin('chang.li@unsw.edu.au', VALID_NEW_PASSWORD) as RequestHelperReturnType;
    expect(loginResult.statusCode).toBe(200);
    expect(loginResult.jsonBody!.sessionId).toBeDefined();
  });

  describe('Password validation tests', () => {
    test.each([
      { testName: 'Password is too short', password: SHORT_PASSWORD, error: 'Password should be more than 8 characters' },
      { testName: 'Password with only letters', password: NO_NUMBER_PASSWORD, error: 'Password needs to contain at least one number and at least one letter' },
      { testName: 'Password with only numbers', password: NO_LETTER_PASSWORD, error: 'Password needs to contain at least one number and at least one letter' }
    ])('Test $testName', ({ password, error }) => {
      const result = adminUserPasswordUpdate(sessionId, 'oldPassword1', password) as RequestHelperReturnType;
      expect(result.statusCode).toBe(400);
      expect(result.jsonBody).toEqual({ error: expect.any(String) });
    });
  });
});

import { adminAuthRegister, adminUserPasswordUpdate, adminAuthLogin, clear } from '../wrappers';

const SUCCESS = {
  statusCode: 200,
  jsonBody: {},
};

const ERROR400 = {
  statusCode: 400,
  jsonBody: { error: expect.any(String) },
};

describe('adminUserPasswordUpdate tests', () => {
  let sessionId: string;

  beforeEach(() => {
    clear();
    const registerResponse = adminAuthRegister('chang.li@unsw.edu.au', 'oldPassword1', 'Chang', 'Li');
    sessionId = registerResponse.jsonBody?.sessionId;
  });

  test('correct return value', () => {
    expect(adminUserPasswordUpdate(sessionId, 'oldPassword1', 'newPassword1')).toStrictEqual(SUCCESS);
  });

  test('Invalid session ID', () => {
    expect(adminUserPasswordUpdate('invalidSessionId', 'oldPassword1', 'newPassword1')).toStrictEqual(ERROR400);
  });

  test('Incorrect old password', () => {
    expect(adminUserPasswordUpdate(sessionId, 'wrongPassword', 'newPassword1')).toStrictEqual(ERROR400);
  });

  test('Old and new password are the same', () => {
    expect(adminUserPasswordUpdate(sessionId, 'oldPassword1', 'oldPassword1')).toStrictEqual(ERROR400);
  });

  test('New password has already been used - check return value', () => {
    expect(adminUserPasswordUpdate(sessionId, 'oldPassword1', 'newPassword1')).toStrictEqual(SUCCESS);

    expect(adminUserPasswordUpdate(sessionId, 'newPassword1', 'anotherNewPassword123')).toStrictEqual(SUCCESS);
  });

  test('New password has already been used - check data store', () => {
    expect(adminUserPasswordUpdate(sessionId, 'oldPassword1', 'newPassword1')).toStrictEqual(SUCCESS);

    expect(adminUserPasswordUpdate(sessionId, 'newPassword1', 'newPassword1')).toStrictEqual(ERROR400);
  });
});

describe('Password validation tests', () => {
  let sessionId: string;

  beforeEach(() => {
    const registerResponse = adminAuthRegister('chang.li@unsw.edu.au', 'oldPassword1', 'Chang', 'Li');
    sessionId = registerResponse.jsonBody?.sessionId;
  });

  test.each([
    { testName: 'Password is too short', password: 'short' },
    { testName: 'Password with only letters', password: 'onlyletters' },
    { testName: 'Password with only numbers', password: '12345678' },
  ])('Test $testName', ({ password }) => {
    expect(adminUserPasswordUpdate(sessionId, 'oldPassword1', password)).toStrictEqual(ERROR400);
  });
});

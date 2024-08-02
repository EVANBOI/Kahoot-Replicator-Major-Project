import { adminAuthRegister, adminUserPasswordUpdate, adminUserPasswordUpdateV2, clear } from '../wrappers';
import {
  VALID_USER_REGISTER_INPUTS_1,
  ERROR400,
  ERROR401,
  SUCCESSFUL_UPDATE
} from '../testConstants';

beforeEach(() => {
  clear();
});

// v1 route tests
describe('adminUserPasswordUpdate success test for v1', () => {
  let sessionId: string;

  beforeEach(() => {
    const registerResponse = adminAuthRegister(
      VALID_USER_REGISTER_INPUTS_1.EMAIL,
      VALID_USER_REGISTER_INPUTS_1.PASSWORD,
      VALID_USER_REGISTER_INPUTS_1.FIRSTNAME,
      VALID_USER_REGISTER_INPUTS_1.LASTNAME
    );
    sessionId = registerResponse.jsonBody?.token;
  });

  test('correct return value', () => {
    expect(adminUserPasswordUpdate(
      sessionId,
      'password1',
      'newPassword1'
    )).toStrictEqual(SUCCESSFUL_UPDATE);
  });
})

describe('adminUserPasswordUpdate failure test for v1', () => {
  let sessionId: string;
  beforeEach(() => {
    const registerResponse = adminAuthRegister(
      VALID_USER_REGISTER_INPUTS_1.EMAIL,
      VALID_USER_REGISTER_INPUTS_1.PASSWORD,
      VALID_USER_REGISTER_INPUTS_1.FIRSTNAME,
      VALID_USER_REGISTER_INPUTS_1.LASTNAME
    );
    sessionId = registerResponse.jsonBody?.token;
  });

  test('Invalid session ID', () => {
    expect(adminUserPasswordUpdate(
      'invalidSessionId',
      'password1',
      'newPassword1')
    ).toStrictEqual(ERROR401);
  });

  test('Incorrect old password', () => {
    expect(adminUserPasswordUpdate(
      sessionId,
      'wrongPassword',
      'newPassword1')
    ).toStrictEqual(ERROR400);
  });
})

// v2 route tests
describe('adminUserPasswordUpdate success tests for v2', () => {
  let sessionId: string;

  beforeEach(() => {
    const registerResponse = adminAuthRegister(
      VALID_USER_REGISTER_INPUTS_1.EMAIL,
      VALID_USER_REGISTER_INPUTS_1.PASSWORD,
      VALID_USER_REGISTER_INPUTS_1.FIRSTNAME,
      VALID_USER_REGISTER_INPUTS_1.LASTNAME
    );
    sessionId = registerResponse.jsonBody?.token;
  });

  test('correct return value', () => {
    expect(adminUserPasswordUpdateV2(
      sessionId,
      'password1',
      'newPassword1'
    )).toStrictEqual(SUCCESSFUL_UPDATE);
  });

  test('Successfully update password twice', () => {
    expect(adminUserPasswordUpdateV2(
      sessionId,
      'password1',
      'newPassword1')
    ).toStrictEqual(SUCCESSFUL_UPDATE);

    expect(adminUserPasswordUpdateV2(
      sessionId,
      'newPassword1',
      'anotherNewPassword123'
    )).toStrictEqual(SUCCESSFUL_UPDATE);
  });
});

describe('adminUserPasswordUpdate failure tests for v2', () => {
  let sessionId: string;

  beforeEach(() => {
    const registerResponse = adminAuthRegister(
      VALID_USER_REGISTER_INPUTS_1.EMAIL,
      VALID_USER_REGISTER_INPUTS_1.PASSWORD,
      VALID_USER_REGISTER_INPUTS_1.FIRSTNAME,
      VALID_USER_REGISTER_INPUTS_1.LASTNAME
    );
    sessionId = registerResponse.jsonBody?.token;
  });

  test('Invalid session ID', () => {
    expect(adminUserPasswordUpdateV2(
      'invalidSessionId',
      'password1',
      'newPassword1')
    ).toStrictEqual(ERROR401);
  });

  test('Incorrect old password', () => {
    expect(adminUserPasswordUpdateV2(
      sessionId,
      'wrongPassword',
      'newPassword1')
    ).toStrictEqual(ERROR400);
  });

  test('Old and new password are the same', () => {
    expect(adminUserPasswordUpdateV2(
      sessionId,
      'password1',
      'password1')
    ).toStrictEqual(ERROR400);
  });

  test('New password has already been used - check data store', () => {
    expect(adminUserPasswordUpdateV2(
      sessionId,
      'password1',
      'newPassword1')
    ).toStrictEqual(SUCCESSFUL_UPDATE);

    expect(adminUserPasswordUpdateV2(
      sessionId,
      'newPassword1',
      'password1')
    ).toStrictEqual(ERROR400);
  });

  test.each([
    { testName: 'Password is too short', password: 'short' },
    { testName: 'Password with only letters', password: 'onlyletters' },
    { testName: 'Password with only numbers', password: '12345678' },
  ])('Test $testName', ({ password }) => {
    expect(adminUserPasswordUpdateV2(sessionId, 'password1', password)).toStrictEqual(ERROR400);
  });
});

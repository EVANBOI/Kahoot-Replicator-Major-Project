import { adminUserDetailsV2, clear, adminAuthRegister, adminAuthLogin } from '../wrappers';
import { ErrorMessage } from '../types';

const VALID_INPUTS = {
  EMAIL: 'admin@email.com',
  PASSWORD: 'password1',
  FIRSTNAME: 'Idk',
  LASTNAME: 'Idk'
};

beforeEach(() => {
  clear();
});

describe('Successful user details retrieval tests', () => {
  test('Valid sessionId returns user details', () => {
    const sessionId = adminAuthRegister(
      VALID_INPUTS.EMAIL,
      VALID_INPUTS.PASSWORD,
      VALID_INPUTS.FIRSTNAME,
      VALID_INPUTS.LASTNAME
    ).jsonBody.token;
    const userDetailsResponse = adminUserDetailsV2(sessionId);

    expect(userDetailsResponse).toEqual({
      jsonBody: {
        user: {
          userId: expect.any(Number),
          name: `${VALID_INPUTS.FIRSTNAME} ${VALID_INPUTS.LASTNAME}`,
          email: VALID_INPUTS.EMAIL,
          numSuccessfulLogins: 1,
          numFailedPasswordsSinceLastLogin: 0,
        }
      },
      statusCode: 200
    });
  });

  test('numFailedPasswordsSinceLastLogin updates after a failed login', () => {
    const sessionId = adminAuthRegister(
      VALID_INPUTS.EMAIL,
      VALID_INPUTS.PASSWORD,
      VALID_INPUTS.FIRSTNAME,
      VALID_INPUTS.LASTNAME
    ).jsonBody.token;

    expect(adminAuthLogin(VALID_INPUTS.EMAIL, VALID_INPUTS.PASSWORD + 'blahblahblah').statusCode).toStrictEqual(400);
    const userDetailsResponse = adminUserDetailsV2(sessionId);

    expect(userDetailsResponse).toEqual({
      jsonBody: {
        user: {
          userId: expect.any(Number),
          name: `${VALID_INPUTS.FIRSTNAME} ${VALID_INPUTS.LASTNAME}`,
          email: VALID_INPUTS.EMAIL,
          numSuccessfulLogins: 1,
          numFailedPasswordsSinceLastLogin: 1,
        }
      },
      statusCode: 200
    });
  });
});

describe('Unsuccessful user details retrieval tests', () => {
  test('Invalid sessionId returns an error', () => {
    const invalidSessionId: string = 'invalid-session-id';
    const userDetailsResponse = adminUserDetailsV2(invalidSessionId) as ErrorMessage;

    expect(userDetailsResponse).toStrictEqual({
      jsonBody: {
        error: expect.any(String)
      },
      statusCode: 401
    });
  });

  test('Empty sessionId returns an error', () => {
    const emptySessionId: string = '';
    const userDetailsResponse = adminUserDetailsV2(emptySessionId) as ErrorMessage;

    expect(userDetailsResponse).toStrictEqual({
      jsonBody: {
        error: expect.any(String)
      },
      statusCode: 401
    });
  });
});

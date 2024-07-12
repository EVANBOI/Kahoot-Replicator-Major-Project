import { adminUserDetails, clear } from '../wrappers';
import { SessionIdObject, UserRegistrationResult, ErrorMessage } from '../types';
import { adminAuthRegister, adminAuthLogin } from '../auth';

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
    const registerResponse = adminAuthRegister(
      VALID_INPUTS.EMAIL,
      VALID_INPUTS.PASSWORD,
      VALID_INPUTS.FIRSTNAME,
      VALID_INPUTS.LASTNAME
    ) as UserRegistrationResult;

    const sessionId: string = (registerResponse as SessionIdObject).token;
    const userDetailsResponse = adminUserDetails(sessionId);

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
    const registerResponse = adminAuthRegister(
      VALID_INPUTS.EMAIL,
      VALID_INPUTS.PASSWORD,
      VALID_INPUTS.FIRSTNAME,
      VALID_INPUTS.LASTNAME
    ) as UserRegistrationResult;

    const sessionId: string = (registerResponse as SessionIdObject).token;

    // Attempt a failed login with an invalid password
    adminAuthLogin(VALID_INPUTS.EMAIL, VALID_INPUTS.PASSWORD + 'blahblahblah');

    const userDetailsResponse = adminUserDetails(sessionId);

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
    const userDetailsResponse = adminUserDetails(invalidSessionId) as ErrorMessage;

    expect(userDetailsResponse).toStrictEqual({
      jsonBody: {
        error: expect.any(String)
      },
      statusCode: 401
    });
  });

  test('Empty sessionId returns an error', () => {
    const emptySessionId: string = '';
    const userDetailsResponse = adminUserDetails(emptySessionId) as ErrorMessage;

    expect(userDetailsResponse).toStrictEqual({
      jsonBody: {
        error: expect.any(String)
      },
      statusCode: 401
    });
  });
});

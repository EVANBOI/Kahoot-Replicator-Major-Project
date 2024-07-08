import { adminAuthRegister, adminUserDetails, clear } from '../wrappers';
import { SessionIdObject, UserRegistrationResult, ErrorMessage } from '../types';

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

    if ('error' in registerResponse) {
      throw new Error(`Registration failed: ${(registerResponse as ErrorMessage).error}`);
    }

    const sessionId: string = (registerResponse as SessionIdObject).sessionId;
    const userDetailsResponse = adminUserDetails(sessionId);
    
    if ('error' in userDetailsResponse) {
      throw new Error(`Fetching user details failed: ${(userDetailsResponse as ErrorMessage).error}`);
    }

    expect(userDetailsResponse).toEqual({
      jsonBody: {
        user: {
          userId: expect.any(Number),
          name: `${VALID_INPUTS.FIRSTNAME} ${VALID_INPUTS.LASTNAME}`,
          email: VALID_INPUTS.EMAIL,
          numSuccessfulLogins: 1,
          numFailedPasswordsSinceLastLogin: 0,
        }
      }
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
      statusCode: 403 // Assuming 403 is returned for invalid session ID
    });
  });

  test('Empty sessionId returns an error', () => {
    const emptySessionId: string = '';
    const userDetailsResponse = adminUserDetails(emptySessionId) as ErrorMessage;

    expect(userDetailsResponse).toStrictEqual({
      jsonBody: {
        error: expect.any(String)
      },
      statusCode: 403 // Assuming 403 is returned for empty session ID
    });
  });
});

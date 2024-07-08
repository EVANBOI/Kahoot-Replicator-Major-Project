import { adminAuthRegister, adminUserDetails } from '../wrappers';
import { clear } from '../wrappers';
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
    const registerResponse = adminAuthRegister(VALID_INPUTS.EMAIL, VALID_INPUTS.PASSWORD, VALID_INPUTS.FIRSTNAME, VALID_INPUTS.LASTNAME) as UserRegistrationResult;

    if ('error' in registerResponse) {
      throw new Error(`Registration failed: ${(registerResponse as ErrorMessage).error}`);
    }

    const sessionId: string = (registerResponse as SessionIdObject).sessionId;
    const result = adminUserDetails(sessionId);
    
    expect(result).toEqual({
      user: {
        userId: expect.any(Number),
        name: `${VALID_INPUTS.FIRSTNAME} ${VALID_INPUTS.LASTNAME}`,
        email: VALID_INPUTS.EMAIL,
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
      }
    });
  });
});

describe('Unsuccessful user details retrieval tests', () => {
  test('Invalid sessionId returns an error', () => {
    const invalidSessionId: string = 'invalid-session-id';
    const result = adminUserDetails(invalidSessionId) as ErrorMessage;

    expect(result).toStrictEqual({ error: expect.any(String) });
  });

  test('Empty sessionId returns an error', () => {
    const emptySessionId: string = '';
    const result = adminUserDetails(emptySessionId) as ErrorMessage;

    expect(result).toStrictEqual({ error: expect.any(String) });
  });
});

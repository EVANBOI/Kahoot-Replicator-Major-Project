import { 
  adminUserDetailsV2, 
  adminUserDetails,
  clear, 
  adminAuthRegister, 
  adminAuthLogin 
} from '../wrappers';

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

// v1 route tests
describe('Successful user details retrieval tests', () => {
  test('Valid sessionId returns user details', () => {
    const sessionId = adminAuthRegister(
      VALID_INPUTS.EMAIL,
      VALID_INPUTS.PASSWORD,
      VALID_INPUTS.FIRSTNAME,
      VALID_INPUTS.LASTNAME
    ).jsonBody.token;
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
  })
})

describe('Unsuccessful user details retrieval tests', () => {
  test('Empty sessionId returns an error', () => {
    const emptySessionId: string = '';
    const userDetailsResponse = adminUserDetails(emptySessionId) as ErrorMessage;
    expect(userDetailsResponse).toStrictEqual({
      jsonBody: {
        error: expect.any(String)
      },
      statusCode: 401
    });
  })
})

// V2 route tests
describe('Successful user details retrieval tests for v2 version', () => {
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

describe('Unsuccessful user details retrieval tests for v2 version', () => {
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

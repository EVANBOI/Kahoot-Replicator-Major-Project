import {  adminUserDetails, clear } from '../wrappers';
import { SessionIdObject, UserRegistrationResult, ErrorMessage } from '../types';
import { adminAuthRegister } from '../auth';
import exp from 'constants';
import { string } from 'yargs';

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

    console.log(JSON.stringify(registerResponse))
    const sessionId: string = (registerResponse as SessionIdObject).token;
    console.log(sessionId);
    const userDetailsResponse = adminUserDetails(sessionId);
    console.log(adminUserDetails(sessionId));
    

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
      statusCode:200
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
      statusCode: 401 // The response should be 401 for invalid details.
    });
  });

  test('Empty sessionId returns an error', () => {
    const emptySessionId: string = '';
    const userDetailsResponse = adminUserDetails(emptySessionId) as ErrorMessage;

    expect(userDetailsResponse).toStrictEqual({
      jsonBody: {
        error: expect.any(String)
      },
      statusCode: 401 // Assuming 403 is returned for empty session ID
    });
  });
});

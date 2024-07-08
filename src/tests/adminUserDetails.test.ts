import { adminAuthRegister, adminUserDetails } from '../auth';
import { clear } from '../other';
import { SessionIdObject } from '../types';

beforeEach(() => {
  clear();
});

test('should return user details for a valid sessionId', (): void => {
  const registerResponse = adminAuthRegister('test.email@domain.com', 'password123', 'Hayden', 'Smith') as SessionIdObject;
  const sessionId: string = registerResponse.sessionId; // Get session id from response
  const result = adminUserDetails(sessionId);

  expect(result).toEqual({
    user: {
      userId: expect.any(Number), // userId is a random number assigned as they register
      name: 'Hayden Smith',
      email: 'test.email@domain.com',
      numSuccessfulLogins: 1,
      numFailedPasswordsSinceLastLogin: 0,
    }
  });
});

test('should return an error for an invalid sessionId', (): void => {
  const invalidSessionId: string = 'invalid-session-id';
  const result = adminUserDetails(invalidSessionId) as { error: string };
  expect(result).toStrictEqual({ error: expect.any(String) });
});

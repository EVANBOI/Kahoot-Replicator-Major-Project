import { adminAuthRegister, adminUserDetails } from '../auth.js';
import { clear } from '../other.js';

// Clear the state before each test
beforeEach(() => {
  clear();
});

test('should return user details for a valid authUserId', (): void => {
  // Register a user to set up the initial state
  const registerResponse = adminAuthRegister('test.email@domain.com', 'password123', 'Hayden', 'Smith') as { authUserId: number };
  const authUserId: number = registerResponse.authUserId;
  const result = adminUserDetails(authUserId) as {
    user: {
      userId: number;
      name: string;
      email: string;
      numSuccessfulLogins: number;
      numFailedPasswordsSinceLastLogin: number;
    }
  };

  expect(result).toEqual({
    user: {
      userId: authUserId,
      name: 'Hayden Smith',
      email: 'test.email@domain.com',
      numSuccessfulLogins: 1,
      numFailedPasswordsSinceLastLogin: 0,
    }
  });
});
test('should return an error for an invalid authUserId', (): void => {
  const invalidAuthUserId: number = -1;
  const result = adminUserDetails(invalidAuthUserId) as { error: string };
  expect(result).toStrictEqual({ error: expect.any(String) });
});

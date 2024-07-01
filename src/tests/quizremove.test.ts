import { adminQuizCreate, adminQuizRemove, adminQuizList } from '../quiz';
import { adminAuthRegister } from '../auth';
import { clear } from '../other';
import { ok } from '../helpers';

// Clear the state before each test
beforeEach(() => {
  clear();
});
test('should successfully remove a quiz', (): void => {
  // Register a user
  const registerResponse = ok(adminAuthRegister('test.email@domain.com', 'password123', 'Hayden', 'Smith'));
  const authUserId: number = registerResponse.authUserId;

  // Create a quiz
  const quizCreateResponse = ok(adminQuizCreate(authUserId, 'Sample Quiz', 'This is a sample quiz.'));
  const quizId: number = quizCreateResponse.quizId;

  // Remove the quiz
  const result = ok(adminQuizRemove(authUserId, quizId));

  // Check that the result is an empty object (successful removal)
  expect(result).toEqual({});

  // Check that the quiz no longer exists in the user's quiz list
  const quizList = ok(adminQuizList(authUserId));
  expect(quizList.quizzes).toHaveLength(0);
});
test('should return an error when removing a quiz with an invalid authUserId', (): void => {
  // Register a user
  const registerResponse = ok(adminAuthRegister('test.email@domain.com', 'password123', 'Hayden', 'Smith'));
  const authUserId: number = registerResponse.authUserId;

  // Create a quiz
  const quizCreateResponse = ok(adminQuizCreate(authUserId, 'Sample Quiz', 'This is a sample quiz.') as { quizId: number });
  const quizId: number = quizCreateResponse.quizId;

  // Use an invalid authUserId
  const invalidAuthUserId: number = authUserId + 1;

  const result = ok(adminQuizRemove(invalidAuthUserId, quizId));

  // Check that the result contains an error message
  expect(result).toStrictEqual({ error: expect.any(String) });
});
test('should return an error when removing a quiz with an invalid quizId', (): void => {
  // Register a user
  const registerResponse = ok(adminAuthRegister('test.email@domain.com', 'password123', 'Hayden', 'Smith'));
  const authUserId: number = registerResponse.authUserId;

  // Create a quiz
  const quizCreateResponse = ok(adminQuizCreate(authUserId, 'Sample Quiz', 'This is a sample quiz.'));
  const validQuizId: number = quizCreateResponse.quizId;

  // Use an invalid quizId
  const invalidQuizId: number = validQuizId + 1;

  const result = ok(adminQuizRemove(authUserId, invalidQuizId));

  // Check that the result contains an error message
  expect(result).toStrictEqual({ error: expect.any(String) });
});
test('should return an error when removing a quiz that the user does not own', (): void => {
  // Register two users
  const registerResponse1 = ok(adminAuthRegister('user1.email@domain.com', 'password123', 'Hayden', 'Smith'));
  const authUserId1: number = registerResponse1.authUserId;

  const registerResponse2 = ok(adminAuthRegister('user2.email@domain.com', 'password123', 'Jane', 'Doe'));
  const authUserId2: number = registerResponse2.authUserId;

  // User 1 creates a quiz
  const quizCreateResponse = ok(adminQuizCreate(authUserId1, 'Sample Quiz', 'This is a sample quiz.'));
  const quizId: number = quizCreateResponse.quizId;

  // User 2 tries to remove User 1's quiz
  const result = ok(adminQuizRemove(authUserId2, quizId));

  // Check that the result contains an error message
  expect(result).toStrictEqual({ error: expect.any(String) });
});

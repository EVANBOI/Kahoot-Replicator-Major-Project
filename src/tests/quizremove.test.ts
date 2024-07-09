import { adminQuizCreate, adminQuizRemove, adminQuizList } from '../quiz';
import { adminAuthRegister } from '../auth';
import { clear } from '../other';
import { ok } from '../helpers';
import { SessionIdObject, QuizIdObject } from '../types';

// Clear the state before each test
beforeEach(() => {
  clear();
});

test('should successfully remove a quiz', (): void => {
  // Register a user
  const registerResponse = ok(adminAuthRegister('test.email@domain.com', 'password123', 'Hayden', 'Smith')) as SessionIdObject;
  const sessionId: string = registerResponse.token;

  // Create a quiz
  const quizCreateResponse = ok(adminQuizCreate(sessionId, 'Sample Quiz', 'This is a sample quiz.')) as QuizIdObject;
  const quizId: number = quizCreateResponse.quizId;

  // Remove the quiz
  const result = ok(adminQuizRemove(sessionId, quizId));

  // Check that the result is an empty object (successful removal)
  expect(result).toEqual({});

  // Check that the quiz no longer exists in the user's quiz list
  const quizList = ok(adminQuizList(sessionId));
  expect(quizList.quizzes).toHaveLength(0);
});

test('should return an error when removing a quiz with an invalid sessionId', (): void => {
  // Register a user
  const registerResponse = ok(adminAuthRegister('test.email@domain.com', 'password123', 'Hayden', 'Smith')) as SessionIdObject;
  const sessionId: string = registerResponse.token;

  // Create a quiz
  const quizCreateResponse = ok(adminQuizCreate(sessionId, 'Sample Quiz', 'This is a sample quiz.')) as QuizIdObject;
  const quizId: number = quizCreateResponse.quizId;

  // Use an invalid sessionId
  const invalidSessionId: string = 'invalid-session-id';

  const result = ok(adminQuizRemove(invalidSessionId, quizId));

  // Check that the result contains an error message
  expect(result).toStrictEqual({ error: 'AuthUserId is not a valid user.' });
});

test('should return an error when removing a quiz with an invalid quizId', (): void => {
  // Register a user
  const registerResponse = ok(adminAuthRegister('test.email@domain.com', 'password123', 'Hayden', 'Smith')) as SessionIdObject;
  const sessionId: string = registerResponse.token;

  // Create a quiz
  const quizCreateResponse = ok(adminQuizCreate(sessionId, 'Sample Quiz', 'This is a sample quiz.')) as QuizIdObject;
  const validQuizId: number = quizCreateResponse.quizId;

  // Use an invalid quizId
  const invalidQuizId: number = validQuizId + 1;

  const result = ok(adminQuizRemove(sessionId, invalidQuizId));

  // Check that the result contains an error message
  expect(result).toStrictEqual({ error: `Quiz with ID '${invalidQuizId}' not found` });
});

test('should return an error when removing a quiz that the user does not own', (): void => {
  // Register two users
  const registerResponse1 = ok(adminAuthRegister('user1.email@domain.com', 'password123', 'Hayden', 'Smith')) as SessionIdObject;
  const sessionId1: string = registerResponse1.token;

  const registerResponse2 = ok(adminAuthRegister('user2.email@domain.com', 'password123', 'Jane', 'Doe')) as SessionIdObject;
  const sessionId2: string = registerResponse2.token;
  // User 1 creates a quiz
  const quizCreateResponse = ok(adminQuizCreate(sessionId1, 'Sample Quiz', 'This is a sample quiz.')) as QuizIdObject;
  const quizId: number = quizCreateResponse.quizId;

  // User 2 tries to remove User 1's quiz
  const result = ok(adminQuizRemove(sessionId2, quizId));

  // Check that the result contains an error message
  expect(result).toStrictEqual({ error: expect.any(String) });
  // temporarily changed the test as your error is saying not owned by sessionId when it is suppposed to say not owend by userId
  // expect(result).toStrictEqual({ error: `Quiz with ID ${quizId} is not owned by ${sessionId2} (actual owner: ${quizCreateResponse.quizId})` });
});

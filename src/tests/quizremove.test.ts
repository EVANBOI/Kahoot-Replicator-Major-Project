import { adminQuizCreate, adminQuizRemove, adminQuizList, adminAuthRegister, clear } from '../wrappers';
import { ok } from '../helpers';
import { SessionIdObject, QuizIdObject, ErrorMessage } from '../types';

// Clear the state before each test
beforeEach(() => {
  clear();
});
test('should successfully remove a quiz', (): void => {
  const sessionId = 'valid-session-id';
  const quizId = 123; // Ensure this quizId exists

  const result = ok(adminQuizRemove(sessionId, quizId)).jsonBody as {};
  expect(result).toEqual({});

  const quizList = ok(adminQuizList(sessionId)).jsonBody;
  expect(quizList.quizzes).toHaveLength(0);
});

test('should return an error when removing a quiz with an invalid sessionId', (): void => {
  const invalidSessionId = 'invalid-session-id';
  const quizId = 123;

  const result = ok(adminQuizRemove(invalidSessionId, quizId)).jsonBody as ErrorMessage;
  expect(result).toStrictEqual({ error: 'AuthUserId is not a valid user.' });
});

test('should return an error when removing a quiz with an invalid quizId', (): void => {
  const sessionId = 'valid-session-id';
  const invalidQuizId = 999; // Ensure this quizId does not exist

  const result = ok(adminQuizRemove(sessionId, invalidQuizId)).jsonBody as ErrorMessage;
  expect(result).toStrictEqual({ error: `Quiz with ID '${invalidQuizId}' not found` });
});

test('should return an error when removing a quiz that the user does not own', (): void => {
  const sessionId2 = 'another-valid-session-id';
  const quizId = 123; // Ensure this quizId is owned by another user

  const result = ok(adminQuizRemove(sessionId2, quizId)).jsonBody as ErrorMessage;
  expect(result).toStrictEqual({ error: `Quiz with ID ${quizId} is not owned by ${sessionId2}` });
});

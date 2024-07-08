import { adminQuizCreate, adminQuizRemove, adminQuizList, adminAuthRegister, clear } from '../wrappers';
import { ok } from '../helpers';
import { SessionIdObject, QuizIdObject, ErrorMessage } from '../types';

// Clear the state before each test
beforeEach(() => {
  clear();
});

test('should successfully remove a quiz', (): void => {
  const registerResponse = ok(adminAuthRegister('test.email@domain.com', 'password123', 'Hayden', 'Smith')).jsonBody as SessionIdObject;
  const sessionId: string = registerResponse.sessionId;

  const quizCreateResponse = ok(adminQuizCreate(sessionId, 'Sample Quiz', 'This is a sample quiz.')).jsonBody as QuizIdObject;
  const quizId: number = quizCreateResponse.quizId;

  const result = ok(adminQuizRemove(sessionId, quizId)).jsonBody as {};

  expect(result).toEqual({});

  const quizList = ok(adminQuizList(sessionId)).jsonBody;
  expect(quizList.quizzes).toHaveLength(0);
});

test('should return an error when removing a quiz with an invalid sessionId', (): void => {
  const registerResponse = ok(adminAuthRegister('test.email@domain.com', 'password123', 'Hayden', 'Smith')).jsonBody as SessionIdObject;
  const sessionId: string = registerResponse.sessionId;

  const quizCreateResponse = ok(adminQuizCreate(sessionId, 'Sample Quiz', 'This is a sample quiz.')).jsonBody as QuizIdObject;
  const quizId: number = quizCreateResponse.quizId;

  const invalidSessionId: string = 'invalid-session-id';

  const result = ok(adminQuizRemove(invalidSessionId, quizId)).jsonBody as ErrorMessage;
  expect(result).toStrictEqual({ error: 'AuthUserId is not a valid user.' });
});

test('should return an error when removing a quiz with an invalid quizId', (): void => {
  const registerResponse = ok(adminAuthRegister('test.email@domain.com', 'password123', 'Hayden', 'Smith')).jsonBody as SessionIdObject;
  const sessionId: string = registerResponse.sessionId;

  const quizCreateResponse = ok(adminQuizCreate(sessionId, 'Sample Quiz', 'This is a sample quiz.')).jsonBody as QuizIdObject;
  const validQuizId: number = quizCreateResponse.quizId;

  const invalidQuizId: number = validQuizId + 1;

  const result = ok(adminQuizRemove(sessionId, invalidQuizId)).jsonBody as ErrorMessage;
  expect(result).toStrictEqual({ error: `Quiz with ID '${invalidQuizId}' not found` });
});

test('should return an error when removing a quiz that the user does not own', (): void => {
  const registerResponse1 = ok(adminAuthRegister('user1.email@domain.com', 'password123', 'Hayden', 'Smith')).jsonBody as SessionIdObject;
  const sessionId1: string = registerResponse1.sessionId;

  const registerResponse2 = ok(adminAuthRegister('user2.email@domain.com', 'password123', 'Jane', 'Doe')).jsonBody as SessionIdObject;
  const sessionId2: string = registerResponse2.sessionId;

  const quizCreateResponse = ok(adminQuizCreate(sessionId1, 'Sample Quiz', 'This is a sample quiz.')).jsonBody as QuizIdObject;
  const quizId: number = quizCreateResponse.quizId;

  const result = ok(adminQuizRemove(sessionId2, quizId)).jsonBody as ErrorMessage;
  expect(result).toStrictEqual({ error: `Quiz with ID ${quizId} is not owned by ${sessionId2} (actual owner: ${quizCreateResponse.quizId})` });
});

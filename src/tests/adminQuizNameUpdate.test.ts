import { clear } from '../other';
import { adminAuthRegister } from '../auth';
import { adminQuizCreate, adminQuizNameUpdate, adminQuizInfo } from '../quiz';
import { SessionIdObject, QuizIdObject, ErrorMessage } from '../types';
import { ok } from '../helpers';

let sessionId: number;
let quizId: number;

beforeEach(() => {
  clear();
});

describe('adminQuizNameUpdate tests', () => {
  beforeEach(() => {
    const user = adminAuthRegister('changli@unsw.edu.au', 'Password123', 'Chang', 'Li') as SessionIdObject;
    sessionId = user.sessionId;
    const quiz = adminQuizCreate(sessionId, 'My Quiz', 'This is a description.') as QuizIdObject;
    quizId = quiz.quizId;
  });

  test('Invalid session ID', () => {
    const result = adminQuizNameUpdate(sessionId + 42, quizId, 'New Quiz Name') as ErrorMessage;
    expect(result).toEqual({ error: 'sessionId is not valid.' });
  });

  test('Invalid quiz ID', () => {
    const result = adminQuizNameUpdate(sessionId, quizId + 42, 'New Quiz Name') as ErrorMessage;
    expect(result).toEqual({ error: 'Quiz ID does not refer to a valid quiz.' });
  });

  test('Quiz not owned by user', () => {
    const anotherUser = adminAuthRegister('another.user@unsw.edu.au', 'Password123', 'Another', 'User') as SessionIdObject;
    const result = adminQuizNameUpdate(anotherUser.sessionId, quizId, 'New Quiz Name') as ErrorMessage;
    expect(result).toEqual({ error: 'Quiz ID does not refer to a quiz that this user owns.' });
  });

  test('Name contains invalid characters', () => {
    const result = adminQuizNameUpdate(sessionId, quizId, 'Invalid@Name') as ErrorMessage;
    expect(result).toEqual({ error: 'Name contains invalid characters. Valid characters are alphanumeric and spaces.' });
  });

  test('Name too short', () => {
    const result = adminQuizNameUpdate(sessionId, quizId, 'AB') as ErrorMessage;
    expect(result).toEqual({ error: 'Name is either less than 3 characters long or more than 30 characters long.' });
  });

  test('Name too long', () => {
    const longName = 'A'.repeat(31);
    const result = adminQuizNameUpdate(sessionId, quizId, longName) as ErrorMessage;
    expect(result).toEqual({ error: 'Name is either less than 3 characters long or more than 30 characters long.' });
  });

  test('Name already used by user', () => {
    adminQuizCreate(sessionId, 'Existing Quiz', 'Another description.');
    const result = adminQuizNameUpdate(sessionId, quizId, 'Existing Quiz') as ErrorMessage;
    expect(result).toEqual({ error: 'Name is already used by the current logged in user for another quiz.' });
  });

  test('Successful quiz name update - correct return value', () => {
    const result = adminQuizNameUpdate(sessionId, quizId, 'New Quiz Name');
    expect(result).toEqual({});
  });

  test('Successful quiz name update - functionality', () => {
    adminQuizNameUpdate(sessionId, quizId, 'New Quiz Name');
    const updatedQuiz = ok(adminQuizInfo(sessionId, quizId));
    expect(updatedQuiz.name).toEqual('New Quiz Name');
  });
});

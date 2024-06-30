import { clear } from '../other.js';
import { adminAuthRegister } from '../auth.js';
import { adminQuizCreate, adminQuizNameUpdate, adminQuizInfo } from '../quiz.js';

let authUserId;
let quizId;

beforeEach(() => {
  clear();
});

describe('adminQuizNameUpdate tests', () => {
  beforeEach(() => {
    const user = adminAuthRegister('changli@unsw.edu.au', 'Password123', 'Chang', 'Li');
    authUserId = user.authUserId;
    const quiz = adminQuizCreate(authUserId, 'My Quiz', 'This is a description.');
    quizId = quiz.quizId;
  });

  test('Invalid user ID', () => {
    const result = adminQuizNameUpdate(999, quizId, 'New Quiz Name');
    expect(result).toEqual({ error: 'AuthUserId is not a valid user.' });
  });

  test('Invalid quiz ID', () => {
    const result = adminQuizNameUpdate(authUserId, 999, 'New Quiz Name');
    expect(result).toEqual({ error: 'Quiz ID does not refer to a valid quiz.' });
  });

  test('Quiz not owned by user', () => {
    const anotherUser = adminAuthRegister('another.user@unsw.edu.au', 'Password123', 'Another', 'User');
    const result = adminQuizNameUpdate(anotherUser.authUserId, quizId, 'New Quiz Name');
    expect(result).toEqual({ error: 'Quiz ID does not refer to a quiz that this user owns.' });
  });

  test('Name contains invalid characters', () => {
    const result = adminQuizNameUpdate(authUserId, quizId, 'Invalid@Name');
    expect(result).toEqual({ error: 'Name contains invalid characters. Valid characters are alphanumeric and spaces.' });
  });

  test('Name too short', () => {
    const result = adminQuizNameUpdate(authUserId, quizId, 'AB');
    expect(result).toEqual({ error: 'Name is either less than 3 characters long or more than 30 characters long.' });
  });

  test('Name too long', () => {
    const longName = 'A'.repeat(31);
    const result = adminQuizNameUpdate(authUserId, quizId, longName);
    expect(result).toEqual({ error: 'Name is either less than 3 characters long or more than 30 characters long.' });
  });

  test('Name already used by user', () => {
    adminQuizCreate(authUserId, 'Existing Quiz', 'Another description.');
    const result = adminQuizNameUpdate(authUserId, quizId, 'Existing Quiz');
    expect(result).toEqual({ error: 'Name is already used by the current logged in user for another quiz.' });
  });

  test('Successful quiz name update - correct return value', () => {
    const result = adminQuizNameUpdate(authUserId, quizId, 'New Quiz Name');
    expect(result).toEqual({});
  });

  test('Successful quiz name update - functionality', () => {
    adminQuizNameUpdate(authUserId, quizId, 'New Quiz Name');
    const updatedQuiz = adminQuizInfo(authUserId, quizId);
    expect(updatedQuiz.name).toEqual('New Quiz Name');
  });
});

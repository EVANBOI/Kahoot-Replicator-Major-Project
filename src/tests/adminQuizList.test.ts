import { adminAuthRegister } from '../auth';
import { adminQuizList, adminQuizCreate } from '../quiz';
import { clear } from '../other';
import { ok } from '../helpers';
const ERROR = { error: expect.any(String) };

beforeEach(() => {
  clear();
});

test('User id is not valid', () => {
  expect(adminQuizList(10)).toStrictEqual(ERROR);
});

describe('Valid user with only no quizzes', () => {
  let userId: number;
  beforeEach(() => {
    userId = ok(adminAuthRegister('admin@unsw.edu.au', 'Password1', 'JJ', 'HH')).authUserId;
  });
  test('There is only one user in database', () => {
    expect(adminQuizList(userId)).toStrictEqual({ quizzes: [] });
  });

  test('There are multiple users in database', () => {
    adminAuthRegister('admin2@unsw.edu.au', 'Password1', 'JJz', 'HHz');
    adminAuthRegister('admin3@unsw.edu.au', 'Password1', 'JJf', 'HHf');
    expect(adminQuizList(userId)).toStrictEqual({ quizzes: [] });
  });
});

describe('Valid user with only one quiz', () => {
  let user1Id: number;
  let quiz1Id: number;
  beforeEach(() => {
    user1Id = ok(adminAuthRegister('admin@unsw.edu.au', 'Password1', 'JJ', 'HH')).authUserId;
    quiz1Id = ok(adminQuizCreate(user1Id, 'Quiz', '')).quizId;
  });
  test('There is only one user in database', () => {
    expect(adminQuizList(user1Id)).toStrictEqual({
      quizzes: [
        {
          quizId: quiz1Id,
          name: 'Quiz'
        }
      ]
    });
  });

  test('There are multiple users in database', () => {
    adminAuthRegister('admin2@unsw.edu.au', 'Password1', 'JJz', 'HHz');
    adminAuthRegister('admin3@unsw.edu.au', 'Password1', 'JJf', 'HHf');
    expect(adminQuizList(user1Id)).toStrictEqual({
      quizzes: [
        {
          quizId: quiz1Id,
          name: 'Quiz'
        }
      ]
    });
  });
});

describe('Valid user with multiple quizzes', () => {
  let user1Id: number;
  let quiz1Id: number, quiz2Id: number, quiz3Id:number;
  beforeEach(() => {
    user1Id = ok(adminAuthRegister('admin@unsw.edu.au', 'Password1', 'JJ', 'HH')).authUserId;
    quiz1Id = ok(adminQuizCreate(user1Id, 'Quiz1', '')).quizId;
    quiz2Id = ok(adminQuizCreate(user1Id, 'Quiz2', '')).quizId;
    quiz3Id = ok(adminQuizCreate(user1Id, 'Quiz3', '')).quizId;
  });
  test('There is only one user in database', () => {
    expect(adminQuizList(user1Id)).toStrictEqual({
      quizzes: [
        {
          quizId: quiz1Id,
          name: 'Quiz1'
        },
        {
          quizId: quiz2Id,
          name: 'Quiz2'
        },
        {
          quizId: quiz3Id,
          name: 'Quiz3'
        }
      ]
    });
  });

  test('There are multiple users in database', () => {
    adminAuthRegister('admin2@unsw.edu.au', 'Password1', 'JJz', 'HHz');
    adminAuthRegister('admin3@unsw.edu.au', 'Password1', 'JJf', 'HHf');
    expect(adminQuizList(user1Id)).toStrictEqual({
      quizzes: [
        {
          quizId: quiz1Id,
          name: 'Quiz1'
        },
        {
          quizId: quiz2Id,
          name: 'Quiz2'
        },
        {
          quizId: quiz3Id,
          name: 'Quiz3'
        }
      ]
    });
  });
});

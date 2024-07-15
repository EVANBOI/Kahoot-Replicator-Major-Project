import { adminAuthRegister, adminQuizList, clear } from '../wrappers';
import { adminQuizCreate } from '../quiz';
import { ok } from '../helpers';
import { ERROR401 } from '../testConstants';

beforeEach(() => {
  clear();
});

test('Session id is not valid', () => {
  expect(adminQuizList('-10')).toStrictEqual(ERROR401);
});

describe('Valid session id with only no quizzes', () => {
  let sessionId: string;
  beforeEach(() => {
    const { jsonBody } = adminAuthRegister('admin@unsw.edu.au', 'Password1', 'JJ', 'HH');
    sessionId = jsonBody?.token;
  });
  test('There is only one user in database', () => {
    expect(adminQuizList(sessionId)).toStrictEqual({
      statusCode: 200,
      jsonBody: { quizzes: [] }
    });
  });

  test('There are multiple users in database', () => {
    adminAuthRegister('admin2@unsw.edu.au', 'Password1', 'JJz', 'HHz');
    adminAuthRegister('admin3@unsw.edu.au', 'Password1', 'JJf', 'HHf');
    expect(adminQuizList(sessionId)).toStrictEqual({
      statusCode: 200,
      jsonBody: { quizzes: [] }
    });
  });
});

describe('Valid user with only one quiz', () => {
  let sessionId1: string;
  let quiz1Id: number;
  beforeEach(() => {
    const { jsonBody } = adminAuthRegister('admin@unsw.edu.au', 'Password1', 'JJ', 'HH');
    sessionId1 = jsonBody?.token;
    quiz1Id = ok(adminQuizCreate(sessionId1, 'Quiz', '')).quizId;
  });

  test('There is only one user in database', () => {
    expect(adminQuizList(sessionId1)).toStrictEqual({
      statusCode: 200,
      jsonBody: {
        quizzes: [
          {
            quizId: quiz1Id,
            name: 'Quiz'
          }
        ]
      }
    });
  });

  test('There are multiple users in database', () => {
    adminAuthRegister('admin2@unsw.edu.au', 'Password1', 'JJz', 'HHz');
    adminAuthRegister('admin3@unsw.edu.au', 'Password1', 'JJf', 'HHf');
    expect(adminQuizList(sessionId1)).toStrictEqual({
      statusCode: 200,
      jsonBody: {
        quizzes: [
          {
            quizId: quiz1Id,
            name: 'Quiz'
          }
        ]
      }
    });
  });
});

describe('Valid user with multiple quizzes', () => {
  let sessionId1: string;
  let quiz1Id: number, quiz2Id: number, quiz3Id:number;
  beforeEach(() => {
    const { jsonBody } = adminAuthRegister('admin@unsw.edu.au', 'Password1', 'JJ', 'HH');
    sessionId1 = jsonBody?.token;
    quiz1Id = ok(adminQuizCreate(sessionId1, 'Quiz1', '')).quizId;
    quiz2Id = ok(adminQuizCreate(sessionId1, 'Quiz2', '')).quizId;
    quiz3Id = ok(adminQuizCreate(sessionId1, 'Quiz3', '')).quizId;
  });
  test('There is only one user in database', () => {
    expect(adminQuizList(sessionId1)).toStrictEqual({
      statusCode: 200,
      jsonBody: {
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
      }
    });
  });

  test('There are multiple users in database', () => {
    adminAuthRegister('admin2@unsw.edu.au', 'Password1', 'JJz', 'HHz');
    adminAuthRegister('admin3@unsw.edu.au', 'Password1', 'JJf', 'HHf');
    expect(adminQuizList(sessionId1)).toStrictEqual({
      statusCode: 200,
      jsonBody: {
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
      }
    });
  });
});

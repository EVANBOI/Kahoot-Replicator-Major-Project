import { adminAuthRegister, adminQuizList } from '../wrappers';
import { adminQuizCreate } from '../quiz';
import { clear } from '../other';
import { ok } from '../helpers';
import { json } from 'stream/consumers';
const ERROR = { 
  statusCode: 401,
  jsonBody: { error: expect.any(String) }
};

beforeEach(() => {
  clear();
});

test.failing('Session id is not valid', () => {
  expect(adminQuizList('-10')).toStrictEqual(ERROR);
});

describe('Valid session id with only no quizzes', () => {
  let sessionId: string;
  beforeEach(() => {
    const { jsonBody } = adminAuthRegister('admin@unsw.edu.au', 'Password1', 'JJ', 'HH');
    sessionId = jsonBody?.sessionId;
  });
  test.failing('There is only one user in database', () => {
    expect(adminQuizList(sessionId)).toStrictEqual({
      status: 200, 
      jsonBody: { quizzes: [] }
    });
  });

  test.failing('There are multiple users in database', () => {
    adminAuthRegister('admin2@unsw.edu.au', 'Password1', 'JJz', 'HHz');
    adminAuthRegister('admin3@unsw.edu.au', 'Password1', 'JJf', 'HHf');
    expect(adminQuizList(sessionId)).toStrictEqual({
      status: 200, 
      jsonBody: { quizzes: [] }
    });
  });
});

describe('Valid user with only one quiz', () => {
  let sessionId1: string;
  let quiz1Id: number;
  beforeEach(() => {
    const { jsonBody } = adminAuthRegister('admin@unsw.edu.au', 'Password1', 'JJ', 'HH');
    sessionId1 = jsonBody?.sessionId;
    quiz1Id = ok(adminQuizCreate(sessionId1, 'Quiz1', '')).quizId;
  });

  test.failing('There is only one user in database', () => {
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

  test.failing('There are multiple users in database', () => {
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
    sessionId1 = jsonBody?.sessionId;
    quiz1Id = ok(adminQuizCreate(sessionId1, 'Quiz1', '')).quizId;
    quiz2Id = ok(adminQuizCreate(sessionId1, 'Quiz2', '')).quizId;
    quiz3Id = ok(adminQuizCreate(sessionId1, 'Quiz3', '')).quizId;
  });
  test.failing('There is only one user in database', () => {
    expect(adminQuizList(sessionId1)).toStrictEqual({
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

  test.failing('There are multiple users in database', () => {
    adminAuthRegister('admin2@unsw.edu.au', 'Password1', 'JJz', 'HHz');
    adminAuthRegister('admin3@unsw.edu.au', 'Password1', 'JJf', 'HHf');
    expect(adminQuizList(sessionId1)).toStrictEqual({
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

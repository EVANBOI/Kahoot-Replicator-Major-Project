import { adminAuthRegister, adminQuizList, clear, adminQuizCreate } from '../wrappers';
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
    const { jsonBody: Quiz1 } = adminQuizCreate(
      sessionId1, 'Quiz', 'this is first original description');
    quiz1Id = Quiz1?.quizId;
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
    const { jsonBody: Quiz1 } = adminQuizCreate(
      sessionId1, 'Quiz1', 'this is first original description');
    quiz1Id = Quiz1?.quizId;
    const { jsonBody: Quiz2 } = adminQuizCreate(
      sessionId1, 'Quiz2', 'this is second original description');
    quiz2Id = Quiz2?.quizId;
    const { jsonBody: Quiz3 } = adminQuizCreate(
      sessionId1, 'Quiz3', 'this is third original description');
    quiz3Id = Quiz3?.quizId;
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

import { adminAuthRegister, adminQuizList, clear, adminQuizCreate, adminQuizListV2 } from '../wrappers';
import { ERROR401 } from '../testConstants';

beforeEach(() => {
  clear();
});

// v1 route tests
describe('Success case for v1 ', () => {
  test('Succesful view empty list', () => {
    const { jsonBody } = adminAuthRegister('admin@unsw.edu.au', 'Password1', 'JJ', 'HH');
    const sessionId1 = jsonBody?.token;
    expect(adminQuizList(sessionId1)).toStrictEqual({
      statusCode: 200,
      jsonBody: { quizzes: [] }
    });
  });
});

describe('Failure case for v1 ', () => {
  test('Invalid session id', () => {
    const { jsonBody } = adminAuthRegister('admin@unsw.edu.au', 'Password1', 'JJ', 'HH');
    const sessionId1 = jsonBody?.token;
    expect(adminQuizList(sessionId1 + '3434')).toStrictEqual(ERROR401);
  });
});

// v2 route tests
test('Session id is not valid for v2', () => {
  expect(adminQuizListV2('-10')).toStrictEqual(ERROR401);
});

describe('Valid session id with only no quizzes for v2', () => {
  let sessionId: string;
  beforeEach(() => {
    const { jsonBody } = adminAuthRegister('admin@unsw.edu.au', 'Password1', 'JJ', 'HH');
    sessionId = jsonBody?.token;
  });
  test('There is only one user in database', () => {
    expect(adminQuizListV2(sessionId)).toStrictEqual({
      statusCode: 200,
      jsonBody: { quizzes: [] }
    });
  });

  test('There are multiple users in database', () => {
    adminAuthRegister('admin2@unsw.edu.au', 'Password1', 'JJz', 'HHz');
    adminAuthRegister('admin3@unsw.edu.au', 'Password1', 'JJf', 'HHf');
    expect(adminQuizListV2(sessionId)).toStrictEqual({
      statusCode: 200,
      jsonBody: { quizzes: [] }
    });
  });
});

describe('Valid user with only one quiz for v2', () => {
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
    expect(adminQuizListV2(sessionId1)).toStrictEqual({
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
    expect(adminQuizListV2(sessionId1)).toStrictEqual({
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

describe('Valid user with multiple quizzes for v2', () => {
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
    expect(adminQuizListV2(sessionId1)).toStrictEqual({
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
    expect(adminQuizListV2(sessionId1)).toStrictEqual({
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

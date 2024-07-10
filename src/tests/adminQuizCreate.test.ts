import { adminAuthRegister } from '../wrappers';
import { adminQuizCreate } from '../wrappers';
import { clear } from '../wrappers';
import { ok } from '../helpers';

const QUIZCREATED = {
  statusCode: 200,
  jsonBody: { quizId: expect.any(Number) }
};

const INVALIDID = {
  statusCode: 401,
  jsonBody: { error: expect.any(String) }
};

const ERROR = {
  statusCode: 400,
  jsonBody: { error: expect.any(String) }
};

beforeEach(() => {
  clear();
});

let sessionId: string;

beforeEach(() => {
  const { jsonBody } =
    adminAuthRegister(
      'evan.xiong@unsw.edu.au',
      'abc1234e',
      'Evan',
      'Xiong');
  sessionId = jsonBody?.token;
});

describe('When registering an user', () => {
  test('SessionId is not a Valid', () => {
    expect(adminQuizCreate(sessionId + 1, 'Quiz 1', 'Pointers')).toStrictEqual(INVALIDID);
  });

  test('Name contains invalid characters', () => {
    expect(adminQuizCreate(sessionId, '汉', 'Pointers')).toStrictEqual(ERROR);
  });

  test.each([
    {
      testName: 'Name is less than 3 characters long',
      name: 'A'
    },
    {
      testName: 'Name is more than 30 characters long',
      name: 'a'.repeat(31)
    }
  ])('Test $#: $testName', ({ name }) => {
    expect(adminQuizCreate(sessionId, name, 'Pointers')).toStrictEqual(ERROR);
  });

  test('Name is already used by the current logged in user', () => {
    expect(adminQuizCreate(sessionId, 'Quiz 1', 'Pointers')).toStrictEqual(QUIZCREATED);
    expect(adminQuizCreate(sessionId, 'Quiz 1', 'Linked Lists')).toStrictEqual(ERROR);
  });

  test.each([
    {
      testName: 'Description is more than 100 characters in length',
      description: 'a'.repeat(101)
    },
    {
      testName: 'Description is more than 100 characters in length',
      description: 'b'.repeat(101)
    }
  ])('Test $#: $testName', ({ description }) => {
    expect(adminQuizCreate(sessionId, 'Quiz 1', description)).toStrictEqual(ERROR);
  });

  test('Correctly returns the quizId', () => {
    console.log(sessionId);
    expect(adminQuizCreate(sessionId, 'Quiz 1', 'Pointers')).toStrictEqual(QUIZCREATED);
  });

  test('Description is an empty string', () => {
    expect(adminQuizCreate(sessionId, 'Quiz 1', ' ')).toStrictEqual(QUIZCREATED);
  });

  test('Sucessfully give two quizIds', () => {
    const { jsonBody } = ok(
      adminAuthRegister(
        'zhihao.cao@unsw.edu.au',
        'qwerty67890',
        'Zhihao',
        'Cao'));
    const sessionId2 = jsonBody?.token;
    expect(adminQuizCreate(sessionId, 'Quiz 1', ' ')).toStrictEqual(QUIZCREATED);
    expect(adminQuizCreate(sessionId2, 'Quiz 2', 'Linked Lists')).toStrictEqual(QUIZCREATED);
    expect(adminQuizCreate(sessionId, 'Quiz 1', ' '))
      .not.toStrictEqual(
        expect(adminQuizCreate(sessionId2, 'Quiz 2', 'Linked Lists'))
      );
  });

  test('Sucessfully give two quizIds for the same user', () => {
    expect(adminQuizCreate(sessionId, 'Quiz 1', ' ')).toStrictEqual(QUIZCREATED);
    expect(adminQuizCreate(sessionId, 'Quiz 2', 'Linked Lists')).toStrictEqual(QUIZCREATED);
    expect(adminQuizCreate(sessionId,
      'Quiz 1', ' ')).not.toStrictEqual(expect(adminQuizCreate(sessionId,
      'Quiz 2', 'Linked Lists')));
  });
});

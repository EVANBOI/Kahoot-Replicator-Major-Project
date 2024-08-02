import { ERROR401, ERROR400 } from '../testConstants';
import { adminAuthRegister } from '../wrappers';
import { adminQuizCreateV2 } from '../wrappers';
import { clear } from '../wrappers';

const QUIZCREATED = {
  statusCode: 200,
  jsonBody: { quizId: expect.any(Number) }
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
    expect(adminQuizCreateV2(sessionId + 1, 'Quiz 1', 'Pointers')).toStrictEqual(ERROR401);
  });

  test('Name contains invalid characters', () => {
    expect(adminQuizCreateV2(sessionId, '汉', 'Pointers')).toStrictEqual(ERROR400);
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
    expect(adminQuizCreateV2(sessionId, name, 'Pointers')).toStrictEqual(ERROR400);
  });

  test('Name is already used by the current logged in user', () => {
    expect(adminQuizCreateV2(sessionId, 'Quiz 1', 'Pointers')).toStrictEqual(QUIZCREATED);
    expect(adminQuizCreateV2(sessionId, 'Quiz 1', 'Linked Lists')).toStrictEqual(ERROR400);
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
    expect(adminQuizCreateV2(sessionId, 'Quiz 1', description)).toStrictEqual(ERROR400);
  });

  test('Correctly returns the quizId', () => {
    expect(adminQuizCreateV2(sessionId, 'Quiz 1', 'Pointers')).toStrictEqual(QUIZCREATED);
  });

  test('Description is an empty string', () => {
    expect(adminQuizCreateV2(sessionId, 'Quiz 1', ' ')).toStrictEqual(QUIZCREATED);
  });

  test('Sucessfully give two quizIds', () => {
    const { jsonBody } = adminAuthRegister(
      'zhihao.cao@unsw.edu.au',
      'qwerty67890',
      'Zhihao',
      'Cao');
    const sessionId2 = jsonBody?.token;
    expect(adminQuizCreateV2(sessionId, 'Quiz 1', ' ')).toStrictEqual(QUIZCREATED);
    expect(adminQuizCreateV2(sessionId2, 'Quiz 2', 'Linked Lists')).toStrictEqual(QUIZCREATED);
    expect(adminQuizCreateV2(sessionId, 'Quiz 1', ' '))
      .not.toStrictEqual(
        expect(adminQuizCreateV2(sessionId2, 'Quiz 2', 'Linked Lists'))
      );
  });

  test('Sucessfully give two quizIds for the same user', () => {
    expect(adminQuizCreateV2(sessionId, 'Quiz 1', ' ')).toStrictEqual(QUIZCREATED);
    expect(adminQuizCreateV2(sessionId, 'Quiz 2', 'Linked Lists')).toStrictEqual(QUIZCREATED);
    expect(adminQuizCreateV2(sessionId,
      'Quiz 1', ' ')).not.toStrictEqual(expect(adminQuizCreateV2(sessionId,
      'Quiz 2', 'Linked Lists')));
  });
});

import { clear } from '../other';
import { adminAuthRegister } from '../auth';
import {
  adminQuizCreate,
  adminQuizDescriptionUpdate,
  adminQuizInfo
} from '../quiz';

const ERROR = { error: expect.any(String) };

const VALID_INPUT = {
  users: [
    {
      authUserId: 1,
      email: 'admin1@gmail.com',
      nameFirst: 'JJ',
      password: 'SDFJKH2349081j',
      nameLast: 'ZLKlsfkdl'
    },
    {
      authUserId: 2,
      email: 'admin2@gmail.com',
      nameFirst: 'JJ',
      password: 'SDFJKH2349081j',
      nameLast: 'ZLKlsfkdl'
    }
  ],
  quizzes: [
    {
      name: 'Heyhey',
      creatorId: 1,
      quizId: 1,
      description: 'This is a quiz 1'
    },
    {
      name: 'Heyhey1',
      creatorId: 1,
      quizId: 2,
      description: 'This is a quiz 2'
    },
    {
      name: 'Heyhey',
      creatorId: 2,
      quizId: 3,
      description: 'This is a quiz 3'
    }
  ]
};

beforeEach(() => {
  clear();
});

describe('Error cases', () => {
  describe('No users exists in database', () => {
    test('Invalid userId', () => {
      expect(adminQuizDescriptionUpdate(0, 1, 'there is no data in database')).toStrictEqual(ERROR);
    });
  });
  describe('users and quizzes exist', () => {
    const users = VALID_INPUT.users;
    const quizzes = VALID_INPUT.quizzes;
    beforeEach(() => {
      for (const user of users) {
        adminAuthRegister(user.email,
          user.password,
          user.nameFirst,
          user.nameFirst);
      }
      for (const quiz of quizzes) {
        adminQuizCreate(quiz.creatorId, quiz.name, quiz.description);
      }
    });

    test.each([
      {
        testName: 'User id does not exist',
        creatorId: users.length + 1,
        quizId: quizzes.length,
        description: 'Changed'
      },
      {
        testName: 'Quiz id does not exist',
        creatorId: users.length,
        quizId: quizzes.length + 1,
        description: 'Changed'
      },
      {
        testName: 'Description is more than 100 characters',
        creatorId: users.length,
        quizId: quizzes.length,
        description: 'a'.repeat(150)
      },
      {
        testName: 'User does not own quiz to be updated',
        creatorId: 1,
        quizId: 3,
        description: 'Changed'
      }
    ])('Test $#: $testName', ({ creatorId, quizId, description }) => {
      expect(adminQuizDescriptionUpdate(creatorId,
        quizId,
        description)).toStrictEqual(ERROR);
    });
  });
});

describe('Successful function run', () => {
  const users = VALID_INPUT.users;
  const quizzes = VALID_INPUT.quizzes;
  beforeEach(() => {
    for (const user of users) {
      adminAuthRegister(user.email,
        user.password,
        user.nameFirst,
        user.nameFirst);
    }
    for (const quiz of quizzes) {
      adminQuizCreate(quiz.creatorId, quiz.name, quiz.description);
    }
  });

  test('Check return type', () => {
    expect(adminQuizDescriptionUpdate(1, 1, 'changed')).toStrictEqual({ });
  });

  test('Quiz is updated once', () => {
    adminQuizDescriptionUpdate(1, 1, 'changed');
    expect(adminQuizInfo(1, 1)).toStrictEqual({
      quizId: 1,
      name: 'Heyhey',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'changed'
    });
  });

  test.each([
    {
      testName: 'User updates same quiz multiple times',
      creatorId1: 1,
      quizId1: 1,
      name1: 'Heyhey',
      description1: 'changed once',
      creatorId2: 1,
      quizId2: 1,
      name2: 'Heyhey',
      description2: 'changed twice'
    },
    {
      testName: 'User updates multiple quizzes',
      creatorId1: 1,
      quizId1: 1,
      name1: 'Heyhey',
      description1: 'first quiz',
      creatorId2: 1,
      quizId2: 2,
      name2: 'Heyhey1',
      description2: 'second quiz'
    },
    {
      testName: 'Different users updates different quizzes',
      creatorId1: 1,
      quizId1: 1,
      name1: 'Heyhey',
      description1: 'first quiz',
      creatorId2: 2,
      quizId2: 3,
      name2: 'Heyhey',
      description2: 'third quiz'
    }
  ])('Test $#: $testName', ({
    creatorId1,
    creatorId2,
    quizId1,
    quizId2,
    name1,
    name2,
    description1,
    description2
  }) => {
    adminQuizDescriptionUpdate(creatorId1, quizId1, description1);
    expect(adminQuizInfo(creatorId1, quizId1)).toStrictEqual({
      quizId: quizId1,
      name: name1,
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: description1
    });
    adminQuizDescriptionUpdate(creatorId2, quizId2, description2);
    expect(adminQuizInfo(creatorId2, quizId2)).toStrictEqual({
      quizId: quizId2,
      name: name2,
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: description2
    });
  });
});
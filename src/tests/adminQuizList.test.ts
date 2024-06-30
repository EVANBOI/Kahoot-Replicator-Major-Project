<<<<<<< HEAD:src/tests/adminQuizList.test.ts
import { adminAuthRegister } from "../auth";
import { adminQuizList, adminQuizCreate } from "../quiz";
import { clear } from "../other";
import { ok } from "./adminQuizDescriptionUpdate.test";
=======
import { adminAuthRegister } from '../auth.js';
import { adminQuizList, adminQuizCreate } from '../quiz.js';
import { clear } from '../other.js';

>>>>>>> master:src/tests/adminQuizList.test.js
const ERROR = { error: expect.any(String) };

beforeEach(() => {
  clear();
});

test('User id is not valid', () => {
  expect(adminQuizList(10)).toStrictEqual(ERROR);
});

describe('Valid user with only no quizzes', () => {
<<<<<<< HEAD:src/tests/adminQuizList.test.ts
    let userId: number;
    beforeEach(() => {
        userId = ok(adminAuthRegister('admin@unsw.edu.au', 'Password1', 'JJ', 'HH')).authUserId;
    })
    test('There is only one user in database', () => {
        expect(adminQuizList(userId)).toStrictEqual({ quizzes: [] });
    });

    test('There are multiple users in database', () => {
        adminAuthRegister('admin2@unsw.edu.au', 'Password1', 'JJz', 'HHz');
        adminAuthRegister('admin3@unsw.edu.au', 'Password1', 'JJf', 'HHf');
        expect(adminQuizList(userId)).toStrictEqual({ quizzes: [] });
    });
})

describe('Valid user with only one quiz', () => {
    let user1Id: number;
    let quiz1Id: number;
    beforeEach(() => {
        user1Id = ok(adminAuthRegister('admin@unsw.edu.au', 'Password1', 'JJ', 'HH')).authUserId;
        quiz1Id = ok(adminQuizCreate(user1Id, 'Quiz', '')).quizId;
    })
    test('There is only one user in database', () => {
        expect(adminQuizList(user1Id)).toStrictEqual({ quizzes: [
            {
                quizId: quiz1Id,
                name: 'Quiz'
            }
        ] });
=======
  let user1Id;
  beforeEach(() => {
    user1Id = adminAuthRegister('admin@unsw.edu.au', 'Password1', 'JJ', 'HH');
  });
  test('There is only one user in database', () => {
    expect(adminQuizList(user1Id.authUserId)).toStrictEqual({ quizzes: [] });
  });

  test('There are multiple users in database', () => {
    adminAuthRegister('admin2@unsw.edu.au', 'Password1', 'JJz', 'HHz');
    adminAuthRegister('admin3@unsw.edu.au', 'Password1', 'JJf', 'HHf');
    expect(adminQuizList(user1Id.authUserId)).toStrictEqual({ quizzes: [] });
  });
});

describe('Valid user with only one quiz', () => {
  let user1Id, quiz1Id;
  beforeEach(() => {
    user1Id = adminAuthRegister('admin@unsw.edu.au', 'Password1', 'JJ', 'HH');
    quiz1Id = adminQuizCreate(user1Id.authUserId, 'Quiz', '');
  });
  test('There is only one user in database', () => {
    expect(adminQuizList(user1Id.authUserId)).toStrictEqual({
      quizzes: [
        {
          quizId: quiz1Id.quizId,
          name: 'Quiz'
        }
      ]
>>>>>>> master:src/tests/adminQuizList.test.js
    });
  });

<<<<<<< HEAD:src/tests/adminQuizList.test.ts
    test('There are multiple users in database', () => {
        adminAuthRegister('admin2@unsw.edu.au', 'Password1', 'JJz', 'HHz');
        adminAuthRegister('admin3@unsw.edu.au', 'Password1', 'JJf', 'HHf');
        expect(adminQuizList(user1Id)).toStrictEqual({ quizzes: [
            {
                quizId: quiz1Id,
                name: 'Quiz'
            }
        ] });
=======
  test('There are multiple users in database', () => {
    adminAuthRegister('admin2@unsw.edu.au', 'Password1', 'JJz', 'HHz');
    adminAuthRegister('admin3@unsw.edu.au', 'Password1', 'JJf', 'HHf');
    expect(adminQuizList(user1Id.authUserId)).toStrictEqual({
      quizzes: [
        {
          quizId: quiz1Id.quizId,
          name: 'Quiz'
        }
      ]
>>>>>>> master:src/tests/adminQuizList.test.js
    });
  });
});

describe('Valid user with multiple quizzes', () => {
<<<<<<< HEAD:src/tests/adminQuizList.test.ts
    let user1Id: number;
    let quiz1Id: number, quiz2Id: number, quiz3Id:number;
    beforeEach(() => {
        user1Id = ok(adminAuthRegister('admin@unsw.edu.au', 'Password1', 'JJ', 'HH')).authUserId;
        quiz1Id = ok(adminQuizCreate(user1Id, 'Quiz1', '')).quizId;
        quiz2Id = ok(adminQuizCreate(user1Id, 'Quiz2', '')).quizId;
        quiz3Id = ok(adminQuizCreate(user1Id, 'Quiz3', '')).quizId;
    })
    test('There is only one user in database', () => {
        expect(adminQuizList(user1Id)).toStrictEqual({ quizzes: [
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
        ] });
=======
  let quiz1Id, quiz2Id, quiz3Id, user1Id;
  beforeEach(() => {
    user1Id = adminAuthRegister('admin@unsw.edu.au', 'Password1', 'JJ', 'HH');
    quiz1Id = adminQuizCreate(user1Id.authUserId, 'Quiz1', '');
    quiz2Id = adminQuizCreate(user1Id.authUserId, 'Quiz2', '');
    quiz3Id = adminQuizCreate(user1Id.authUserId, 'Quiz3', '');
  });
  test('There is only one user in database', () => {
    expect(adminQuizList(user1Id.authUserId)).toStrictEqual({
      quizzes: [
        {
          quizId: quiz1Id.quizId,
          name: 'Quiz1'
        },
        {
          quizId: quiz2Id.quizId,
          name: 'Quiz2'
        },
        {
          quizId: quiz3Id.quizId,
          name: 'Quiz3'
        }
      ]
>>>>>>> master:src/tests/adminQuizList.test.js
    });
  });

<<<<<<< HEAD:src/tests/adminQuizList.test.ts
    test('There are multiple users in database', () => {
        adminAuthRegister('admin2@unsw.edu.au', 'Password1', 'JJz', 'HHz');
        adminAuthRegister('admin3@unsw.edu.au', 'Password1', 'JJf', 'HHf');
        expect(adminQuizList(user1Id)).toStrictEqual({ quizzes: [
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
        ] });
=======
  test('There are multiple users in database', () => {
    adminAuthRegister('admin2@unsw.edu.au', 'Password1', 'JJz', 'HHz');
    adminAuthRegister('admin3@unsw.edu.au', 'Password1', 'JJf', 'HHf');
    expect(adminQuizList(user1Id.authUserId)).toStrictEqual({
      quizzes: [
        {
          quizId: quiz1Id.quizId,
          name: 'Quiz1'
        },
        {
          quizId: quiz2Id.quizId,
          name: 'Quiz2'
        },
        {
          quizId: quiz3Id.quizId,
          name: 'Quiz3'
        }
      ]
>>>>>>> master:src/tests/adminQuizList.test.js
    });
  });
});

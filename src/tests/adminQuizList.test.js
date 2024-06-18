import { adminAuthRegister } from "../auth.js";
import { adminQuizList, adminQuizCreate } from "../quiz.js";
import { clear } from "../other.js";
beforeEach(() => {
    clear();
})

test.failing('User id is not valid', () => {
    expect(adminQuizList(10)).toStrictEqual({ error: expect.any(String) })
});

describe('Valid user with only no quizzes', () => {
    let user1Id;
    beforeEach(() => {
        user1Id = adminAuthRegister('admin@unsw.edu.au', 'Password1', 'JJ', 'HH')
    })
    test.failing('There is only one user in database', () => {
        expect(adminQuizList(user1Id)).toStrictEqual({ quizzes: [] });
    });

    test.failing('There are multiple users in database', () => {
        adminAuthRegister('admin2@unsw.edu.au', 'Password1', 'JJz', 'HHz');
        adminAuthRegister('admin3@unsw.edu.au', 'Password1', 'JJf', 'HHf');
        expect(adminQuizList(user1Id)).toStrictEqual({ quizzes: [] });
    });
})

describe('Valid user with only one quiz', () => {
    let user1Id, quiz1Id;
    beforeEach(() => {
        user1Id = adminAuthRegister('admin@unsw.edu.au', 'Password1', 'JJ', 'HH')
        quiz1Id = adminQuizCreate(user1Id, 'Quiz');
    })
    test.failing('There is only one user in database', () => {
        expect(adminQuizList(user1Id)).toStrictEqual({ quizzes: [
            {
                quizId: quiz1Id
            }
        ] });
    });

    test.failing('There are multiple users in database', () => {
        adminAuthRegister('admin2@unsw.edu.au', 'Password1', 'JJz', 'HHz');
        adminAuthRegister('admin3@unsw.edu.au', 'Password1', 'JJf', 'HHf');
        expect(adminQuizList(user1Id)).toStrictEqual({ quizzes: [
            {
                quizId: quiz1Id
            }
        ] });
    });
})
describe('Valid user with multiple quizzes', () => {
    let quiz1Id, quiz2Id, quiz3Id, user1Id;
    beforeEach(() => {
        user1Id = adminAuthRegister('admin@unsw.edu.au', 'Password1', 'JJ', 'HH');
        quiz1Id = adminQuizCreate(user1Id, 'Quiz 1');
        quiz2Id = adminQuizCreate(user1Id, 'Quiz 2');
        quiz3Id = adminQuizCreate(user1Id, 'Quiz 3');
    })
    test.failing('There is only one user in database', () => {
        expect(adminQuizList(user1Id)).toStrictEqual({ quizzes: [
            {
                quizId: quiz1Id
            },
            {
                quizId: quiz2Id
            },
            {
                quizId: quiz3Id
            }
        ] });
    });

    test.failing('There are multiple users in database', () => {
        adminAuthRegister('admin2@unsw.edu.au', 'Password1', 'JJz', 'HHz');
        adminAuthRegister('admin3@unsw.edu.au', 'Password1', 'JJf', 'HHf');
        expect(adminQuizList(user1Id)).toStrictEqual({ quizzes: [
            {
                quizId: quiz1Id
            },
            {
                quizId: quiz2Id
            },
            {
                quizId: quiz3Id
            }
        ] });
    });
})

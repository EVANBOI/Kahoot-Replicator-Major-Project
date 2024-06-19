import { adminAuthRegister } from "../auth.js";
import { adminQuizList, adminQuizCreate } from "../quiz.js";
import { clear } from "../other.js";

const ERROR = { error: expect.any(String) };

beforeEach(() => {
    clear();
})

test('User id is not valid', () => {
    expect(adminQuizList(10)).toStrictEqual(ERROR)
});

describe('Valid user with only no quizzes', () => {
    let user1Id;
    beforeEach(() => {
        user1Id = adminAuthRegister('admin@unsw.edu.au', 'Password1', 'JJ', 'HH')
    })
    test('There is only one user in database', () => {
        expect(adminQuizList(user1Id.authUserId)).toStrictEqual({ quizzes: [] });
    });

    test('There are multiple users in database', () => {
        adminAuthRegister('admin2@unsw.edu.au', 'Password1', 'JJz', 'HHz');
        adminAuthRegister('admin3@unsw.edu.au', 'Password1', 'JJf', 'HHf');
        expect(adminQuizList(user1Id.authUserId)).toStrictEqual({ quizzes: [] });
    });
})

describe('Valid user with only one quiz', () => {
    let user1Id, quiz1Id;
    beforeEach(() => {
        user1Id = adminAuthRegister('admin@unsw.edu.au', 'Password1', 'JJ', 'HH');
        quiz1Id = adminQuizCreate(user1Id.authUserId, 'Quiz', '');
    })
    test('There is only one user in database', () => {
        expect(adminQuizList(user1Id.authUserId)).toStrictEqual({ quizzes: [
            {
                quizId: quiz1Id.quizId,
                name: 'Quiz'
            }
        ] });
    });

    test('There are multiple users in database', () => {
        adminAuthRegister('admin2@unsw.edu.au', 'Password1', 'JJz', 'HHz');
        adminAuthRegister('admin3@unsw.edu.au', 'Password1', 'JJf', 'HHf');
        expect(adminQuizList(user1Id.authUserId)).toStrictEqual({ quizzes: [
            {
                quizId: quiz1Id.quizId,
                name: 'Quiz'
            }
        ] });
    });
})
describe('Valid user with multiple quizzes', () => {
    let quiz1Id, quiz2Id, quiz3Id, user1Id;
    beforeEach(() => {
        user1Id = adminAuthRegister('admin@unsw.edu.au', 'Password1', 'JJ', 'HH');
        quiz1Id = adminQuizCreate(user1Id.authUserId, 'Quiz1', '');
        quiz2Id = adminQuizCreate(user1Id.authUserId, 'Quiz2', '');
        quiz3Id = adminQuizCreate(user1Id.authUserId, 'Quiz3', '');
    })
    test('There is only one user in database', () => {
        expect(adminQuizList(user1Id.authUserId)).toStrictEqual({ quizzes: [
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
        ] });
    });

    test('There are multiple users in database', () => {
        adminAuthRegister('admin2@unsw.edu.au', 'Password1', 'JJz', 'HHz');
        adminAuthRegister('admin3@unsw.edu.au', 'Password1', 'JJf', 'HHf');
        expect(adminQuizList(user1Id.authUserId)).toStrictEqual({ quizzes: [
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
        ] });
    });
})

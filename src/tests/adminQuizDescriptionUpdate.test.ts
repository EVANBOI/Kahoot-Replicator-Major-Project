import { clear } from "../other.ts";
import { adminAuthRegister } from "../auth.ts";
import { adminQuizCreate, 
    adminQuizDescriptionUpdate, 
    adminQuizInfo } from "../quiz.ts";
export function ok<T>(item: T | { error: string }): T {
    return item as T;
}
const ERROR = { error: expect.any(String) };

beforeEach(() => {
    clear();
})

describe('Error cases', () => {
    describe('No users exists in database', () => {
        test('Invalid userId', () => {
            expect(adminQuizDescriptionUpdate(0,1,'there is no data in database')).toStrictEqual(ERROR);
        });
    })
    describe('users and quizzes exist', () => {
        let userId1: number;
        let userId2: number;
        let quizId1: number;
        beforeEach(() => {
            const user1 = ok(adminAuthRegister('admin1@gmail.com', 'SDFJKH2349081j', 'JJone', 'ZZ'));
            userId1 = user1.authUserId;
            const user2 = ok(adminAuthRegister('admin2@gmail.com', 'SDFJKH2349081j', 'JJone', 'ZZ'));
            userId2 = user2.authUserId;
            const quiz1 = ok(adminQuizCreate(user1.authUserId, 'Quiz 1', 'this is first original description'));
            quizId1 = quiz1.quizId;
        })

        test('User id does not exist', () => {
            expect(adminQuizDescriptionUpdate(-999, quizId1, 'changed description')).toStrictEqual(ERROR);
        })
        test('Quiz id does not exist', () => {
            expect(adminQuizDescriptionUpdate(userId1, -999, 'changed description')).toStrictEqual(ERROR);
        })
        test('User does not own quiz to be updated', () => {
            expect(adminQuizDescriptionUpdate(userId2, quizId1, 'changed description')).toStrictEqual(ERROR);
        })
    })
})

describe('Successful function run', () => {
    let userId1: number;
    let userId2: number;
    let quizId1: number;
    let quizId2: number;
    let quizId3: number;
    beforeEach(() => {
        const user1 = ok(adminAuthRegister('admin1@gmail.com', 'SDFJKH2349081j', 'JJone', 'ZZ'));
        userId1 = user1.authUserId;
        const user2 = ok(adminAuthRegister('admin2@gmail.com', 'SDFJKH2349081j', 'JJone', 'ZZ'));
        userId2 = user2.authUserId;
        const quiz1 = ok(adminQuizCreate(user1.authUserId, 'Quiz 1', 'this is first original description'));
        quizId1 = quiz1.quizId;
        const quiz2 = ok(adminQuizCreate(user1.authUserId, 'Quiz 2', 'this is second original description'));
        quizId2 = quiz2.quizId;
        const quiz3 = ok(adminQuizCreate(user1.authUserId, 'Quiz 3', 'this is third original description'));
        quizId3 = quiz3.quizId;
    })
    test('Check return type', () => {
        expect(adminQuizDescriptionUpdate(userId1, quizId1, 'changed')).toStrictEqual({});
    });

    test('Quiz is updated once correctly', () => {
        adminQuizDescriptionUpdate(userId1, quizId1, 'changed');
        expect(adminQuizInfo(userId1, quizId1)).toStrictEqual({
            quizId: quizId1,
            name: 'Quiz 1',
            timeCreated: expect.any(Number),
            timeLastEdited: expect.any(Number),
            description: 'changed'
        });
    });

    test('User updates same quiz multiple times', () => {
        adminQuizDescriptionUpdate(userId1, quizId1, 'changed');
        adminQuizDescriptionUpdate(userId1, quizId1, 'changed twice');
        expect(adminQuizInfo(userId1, quizId1)).toStrictEqual({
            quizId: quizId1,
            name: 'Quiz 1',
            timeCreated: expect.any(Number),
            timeLastEdited: expect.any(Number),
            description: 'changed twice'
        });
    });

    test('User updates multiple different quizzes', () => {
        adminQuizDescriptionUpdate(userId1, quizId1, 'changed quiz 1');
        adminQuizDescriptionUpdate(userId1, quizId2, 'changed quiz 2');
        expect(adminQuizInfo(userId1, quizId2)).toStrictEqual({
            quizId: quizId2,
            name: 'Quiz 2',
            timeCreated: expect.any(Number),
            timeLastEdited: expect.any(Number),
            description: 'changed quiz 2'
        });
    });

    test('Different users updates different quizzes', () => {
        adminQuizDescriptionUpdate(userId1, quizId1, 'changed quiz 1');
        adminQuizDescriptionUpdate(userId2, quizId3, 'changedquiz 3');
        expect(adminQuizInfo(userId2, quizId3)).toStrictEqual({
            quizId: quizId3,
            name: 'Quiz 3',
            timeCreated: expect.any(Number),
            timeLastEdited: expect.any(Number),
            description: 'changed quiz 3'
        });
    });
})
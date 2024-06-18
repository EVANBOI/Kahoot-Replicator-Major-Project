import { clear } from "../other.js";
import { adminAuthRegister } from "../auth.js";
import { adminQuizCreate, 
    adminQuizDescriptionUpdate, 
    adminQuizInfo } from "../quiz.js";

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
            authUserId: 1,
            quizId: 1,
            timeCreated: 11,
            timeLastEdited: 12,
            description: 'This is a quiz 1'
        },
        {
            name: 'Heyhey',
            authUserId: 1,
            quizId: 2,
            timeCreated: 11,
            timeLastEdited: 12,
            description: 'This is a quiz 2'
        },
        {
            name: 'Heyhey',
            authUserId: 2,
            quizId: 3,
            timeCreated: 11,
            timeLastEdited: 12,
            description: 'This is a quiz 3'
        }
    ]    
};

beforeEach(() => {
    clear();
}) 

describe('Error cases', () => {
    describe('No users exists in database', () => {
        test.failing('Invalid userId', () => {
            expect(adminQuizDescriptionUpdate(VALID_INPUT.users.length + 1, 
                VALID_INPUT.quizzes.quizId, 
                VALID_INPUT.quizzes.description)).toStrictEqual(ERROR);
        })
    })
    describe('users and quizzes exist', () => {
        let users = VALID_INPUT.users;
        let quizzes = VALID_INPUT.quizzes;
        beforeEach(() => {
            for (const user of users) {
                adminAuthRegister(user.email, 
                    user.password, 
                    user.nameFirst, 
                    user.nameFirst);
            }
            for (const quiz of quizzes) {
                adminQuizCreate(quiz.authUserId, quiz.name, quiz.description);
            }
        })

        test.failing.each([
            {
                testName: 'User id does not exist',
                authUserId: users.length + 1,
                quizId: quizzes.length,
                description: 'Changed'
            },
            {
                testName: 'Quiz id does not exist',
                authUserId: users.length,
                quizId: quizzes.length + 1,
                description: 'Changed'
            },
            {
                testName: 'Description is more than 100 characters',
                authUserId: users.length,
                quizId: quizzes.length,
                description: 'a'.repeat(150)
            },
            {
                testName: 'User does not own quiz to be updated',
                authUserId: 1,
                quizId: 3,
                description: 'Changed'
            }
        ])('Test $#: $testName', ({ authUserId, quizId, description }) => {
            expect(adminQuizDescriptionUpdate(authUserId, 
                quizId, 
                description)).toStrictEqual(ERROR)
        })
    })
});

describe('Successful function run', () => {
    let users = VALID_INPUT.users;
    let quizzes = VALID_INPUT.quizzes;
    beforeEach(() => {
        for (const user of users) {
            adminAuthRegister(user.email, 
                user.password, 
                user.nameFirst, 
                user.nameFirst);
        }
        for (const quiz of quizzes) {
            adminQuizCreate(quiz.authUserId, quiz.name, quiz.description);
        }
    })
    test('Check return type', () => {
        expect(adminQuizDescriptionUpdate(1, 1, 'changed')).toStrictEqual({ });
    })

    test.failing('Quiz  is updated once', () => {
        adminQuizDescriptionUpdate(1, 1, 'changed');
        expect(adminQuizInfo(1, 1)).toStrictEqual({
            quizId: 1,
            name: 'Heyhey',
            timeCreated: 11,
            timeLastEdited: 12,
            description: 'changed'
        })
    })

    test.failing.each([
        {
            testName: 'User updates same quiz multiple times',
            authUserId1: 1,
            quizId1: 1,
            description1: 'changed once',
            authUserId2: 1,
            quizId2: 1,
            description2: 'changed twice'
        },
        {
            testName: 'User updates multiple quizzes',
            authUserId1: 1,
            quizId1: 1,
            description1: 'first quiz',
            authUserId2: 1,
            quizId2: 2,
            description2: 'second quiz'
        },
        {
            testName: 'Different users updates different quizzes',
            authUserId1: 1,
            quizId1: 1,
            description1: 'first quiz',
            authUserId2: 2,
            quizId2: 3,
            description2: 'third quiz'
        }
    ])('Test $#: $testName', ({ authUserId1, 
        authUserId2, 
        quizId1, 
        quizId2, 
        description1, 
        description2 }) => {
        expect(adminQuizInfo(authUserId1, quizId1)).toStrictEqual({
            quizId: quizId1,
            name: 'Heyhey',
            timeCreated: 11,
            timeLastEdited: 12,
            description: description1
        })
        expect(adminQuizInfo(authUserId2, quizId2)).toStrictEqual({
            quizId: quizId2,
            name: 'Heyhey',
            timeCreated: 11,
            timeLastEdited: 12,
            description: description2
        })
    })
})

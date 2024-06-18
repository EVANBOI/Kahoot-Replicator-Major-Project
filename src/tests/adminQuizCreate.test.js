import { adminAuthRegister } from '../auth.js';
import { adminQuizCreate } from '../quiz.js';
import { clear } from '../other.js';

beforeEach(() => {
    clear();
})

describe ('when registering an AuthUserId', () => {
    let Id;
    beforeEach(() => {
        Id = adminAuthRegister('evan.xiong@unsw.edu.au', 'abcde12345', 'Evan', 'Xiong');
    });
    test.failing('AuthUserId is not a valid user', () => {
        expect(adminQuizCreate(Id.authUserId + 1, 'Quiz 1', 'Pointers')).toStrictEqual({ error: expect.any(String) });
    })
    test.failing('Name contains invalid characters', () => {
        expect(adminQuizCreate(Id.authUserId, '汉', 'Pointers')).toStrictEqual({ error: expect.any(String) });
    })
    test.failing.each([ 
        {
            testName: 'Name is less than 3 characters long',
            name: 'A'
        }, 
        {
            testName: 'Name is more than 30 characters long',
            name: 'a'.repeat(31)
        }
    ])("Test $#: $testName", ({ name }) => {
        expect(adminQuizCreate(Id.authUserId, name, 'Pointers')).toStrictEqual({ error: expect.any(String) });
    })

    test('Correctly returns the quizId', () => {
        expect(adminQuizCreate(Id.authUserId, 'Quiz 1', 'Pointers')).toStrictEqual({ quizId: expect.any(Number) });
    })

    test.failing('Name is already used by the current logged in user', () => {
        expect(adminQuizCreate(Id.authUserId, 'Quiz 1', 'Pointers')).toStrictEqual({ quizId: expect.any(Number) });
        expect(adminQuizCreate(Id.authUserId, 'Quiz 1', 'Linked Lists')).toStrictEqual({ error: expect.any(String) });
        
    });
    test.failing.each([
        {
            testName: 'Description is more than 100 characters in length',
            description: 'a'.repeat(101)
        },
        {
            testName: 'Description is more than 100 characters in length',
            description: 'b'.repeat(101)
        } 
    ]) ("Test $#: $testName", ({ description }) => {
        expect(adminQuizCreate(Id.authUserId, 'Quiz 1', description)).toStrictEqual({ error: expect.any(String) });
    })
    test.failing('Description is an empty string', () => {
        expect(adminQuizCreate(Id.authUserId, 'Quiz 1', ' ')).toStrictEqual({ quizId: expect.any(Number) });
    })

    test.failing('Sucessfully give two quizIds', () => {
        Id2 = adminAuthRegister('zhihao.cao@unsw.edu.au', 'qwerty67890', 'Zhihao', 'Cao');
        expect(adminQuizCreate(Id.authUserId, 'Quiz 1', ' ')).toStrictEqual({ quizId: expect.any(Number)});
        expect(adminQuizCreate(Id2.authUserId, 'Quiz 2', 'Linked Lists')).toStrictEqual({ quizId: expect.any(Number) });
        expect(adminQuizCreate(Id.authUserId, 'Quiz 1', ' ')).not.toStrictEqual(expect(adminQuizCreate(Id2.authUserId, 'Quiz 2', 'Linked Lists')));
    })
})


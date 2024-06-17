import { adminAuthRegister, adminAuthLogin } from '../auth.js';
import { clear } from '../other.js';

beforeEach(() => {
    // Reset the state of our data so that each tests can run independently
    clear();
});

describe('adminAuthlogin', () => {

    test.failing('return an error for a non-existent email address', () => {
        expect(adminAuthLogin(" ", "abcde12345")).toStrictEqual({ error: expect.any(String)});
    });

    describe('when registering an authUserId', () => {
        let Id;
        beforeEach(() => {
            Id = adminAuthRegister('evan.xiong@unsw.edu.au', 'abcde12345', 'Evan', 'Xiong');
        });

        test.failing('return an error for a password that is not correct for the given email', () => {
            let wrong_password = 'abcde12345';
            wrong_password += 'a';
            expect(adminAuthLogin('evan.xiong@unsw.edu.au', wrong_password)).toStrictEqual( { error: expect.any(String) });
        });


        test('correctly returns their authUserId', () => {
            expect(adminAuthLogin('evan.xiong@unsw.edu.au', 'abcde12345')).toStrictEqual({ authUserId: expect.any(Number) });
            expect(Id).toStrictEqual(adminAuthLogin('evan.xiong@unsw.edu.au', 'abcde12345'));
        });

        
    })

    test('correctly returns two authuserIds', () => {
        const Id1 = adminAuthRegister('evan.xiong@unsw.edu.au', 'abcde12345', 'Evan', 'Xiong');
        const Id2 = adminAuthRegister('jessie.zhang@unsw.edu.au', 'qwerty67890', 'Jessie', 'Zhang');
        expect(adminAuthLogin('evan.xiong@unsw.edu.au', 'abcde12345')).toStrictEqual({ authUserId: expect.any(Number) })
        expect(Id1).toStrictEqual(adminAuthLogin('evan.xiong@unsw.edu.au', 'abcde12345'));
        expect(adminAuthLogin('jessie.zhang@unsw.edu.au', 'qwerty67890')).toStrictEqual({ authUserId: expect.any(Number) })
        expect(Id2).toStrictEqual(adminAuthLogin('jessie.zhang@unsw.edu.au', 'qwerty67890'));
        expect(Id1).not.toStrictEqual(expect(Id2));
    });

})


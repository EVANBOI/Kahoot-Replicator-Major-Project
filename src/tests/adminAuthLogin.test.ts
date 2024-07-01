import { adminAuthRegister, adminAuthLogin } from '../auth';
import { clear } from '../other';
import { AuthUserIdObject } from '../types';
import { ok } from '../helpers';

beforeEach(() => {
  // Reset the state of our data so that each tests can run independently
  clear();
});

test('return an error for a non-existent email address', () => {
  expect(adminAuthLogin(' ', 'abcde12345')).toStrictEqual({ error: expect.any(String) });
});

describe('when registering an authUserId', () => {
  let Id: AuthUserIdObject;
  beforeEach(() => {
    Id = ok(adminAuthRegister('evan.xiong@unsw.edu.au', 'abcde12345', 'Evan', 'Xiong'));
  });

  test('return an error for a password that is not correct for the given email', () => {
    const wrongPassword = 'abcde12345' + 'a';
    expect(adminAuthLogin('evan.xiong@unsw.edu.au', wrongPassword)).toStrictEqual({ error: expect.any(String) });
  });

  test('correctly returns their authUserId', () => {
    expect(adminAuthLogin('evan.xiong@unsw.edu.au', 'abcde12345')).toStrictEqual({ authUserId: Id.authUserId });
  });
});

test('correctly returns two authuserIds', () => {
  const Id1: AuthUserIdObject = ok(adminAuthRegister('evan.xiong@unsw.edu.au', 'abcde12345', 'Evan', 'Xiong'));
  const Id2: AuthUserIdObject = ok(adminAuthRegister('jessie.zhang@unsw.edu.au', 'qwerty67890', 'Jessie', 'Zhang'));
  expect(adminAuthLogin('evan.xiong@unsw.edu.au', 'abcde12345')).toStrictEqual({ authUserId: Id1.authUserId });
  expect(adminAuthLogin('jessie.zhang@unsw.edu.au', 'qwerty67890')).toStrictEqual({ authUserId: Id2.authUserId });
  expect(Id1).not.toStrictEqual(expect(Id2));
});

test('correctly returns two authuserIds', () => {
  const Id1: AuthUserIdObject = ok(adminAuthRegister('evan.xiong@unsw.edu.au', 'abcde12345', 'Evan', 'Xiong'));
  const Id2: AuthUserIdObject = ok(adminAuthRegister('jessie.zhang@unsw.edu.au', 'qwerty67890', 'Jessie', 'Zhang'));
  expect(adminAuthLogin('evan.xiong@unsw.edu.au', 'abcde12345')).toStrictEqual({ authUserId: Id1.authUserId });
  expect(adminAuthLogin('jessie.zhang@unsw.edu.au', 'qwerty67890')).toStrictEqual({ authUserId: Id2.authUserId });
  expect(Id1).not.toStrictEqual(expect(Id2));
});

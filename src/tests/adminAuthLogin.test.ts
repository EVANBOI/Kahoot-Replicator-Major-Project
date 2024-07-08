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

describe('Tests after registering a user', () => {
  beforeEach(() => {
    ok(adminAuthRegister('evan.xiong@unsw.edu.au', 'abcde12345', 'Evan', 'Xiong'));
  });

  test('Return an error for a password that is not correct for the given email', () => {
    const wrongPassword = 'abcde12345' + 'a';
    expect(adminAuthLogin('evan.xiong@unsw.edu.au', wrongPassword)).toStrictEqual({ error: expect.any(String) });
  });

  test('Correctly returns their sessionId', () => {
    expect(adminAuthLogin('evan.xiong@unsw.edu.au', 'abcde12345')).toStrictEqual({ sessionId: expect.any(String) });
  });
});

test('Correctly returns two sessionId', () => {
  const Id1: AuthUserIdObject = ok(adminAuthRegister('evan.xiong@unsw.edu.au', 'abcde12345', 'Evan', 'Xiong'));
  const Id2: AuthUserIdObject = ok(adminAuthRegister('jessie.zhang@unsw.edu.au', 'qwerty67890', 'Jessie', 'Zhang'));
  expect(adminAuthLogin('evan.xiong@unsw.edu.au', 'abcde12345')).toStrictEqual({ sessionId: expect.any(String) });
  expect(adminAuthLogin('jessie.zhang@unsw.edu.au', 'qwerty67890')).toStrictEqual({ sessionId: expect.any(String) });
  expect(Id1).not.toStrictEqual(expect(Id2));
});

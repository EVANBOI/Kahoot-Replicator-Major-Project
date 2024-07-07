import { adminAuthRegister, adminAuthLogin } from '../wrappers';
import { clear } from '../wrappers';
import { ok } from '../helpers';

const SUCCESSFULLOGIN = {
  statusCode: 200,
  jsonBody: { sessionId: expect.any(String) }
};

const ERROR = {
  statusCode: 400,
  jsonBody: { error: expect.any(String) }
};

beforeEach(() => {
  // Reset the state of our data so that each tests can run independently
  clear();
});

test.failing('Return an error for a non-existent email address', () => {
  expect(adminAuthLogin(' ', 'abcde12345')).toStrictEqual(ERROR);

});

describe('Tests after registering a user', () => {
  beforeEach(() => {
    ok(adminAuthRegister('evan.xiong@unsw.edu.au', 'abcde12345', 'Evan', 'Xiong'));
  });

  test.failing('Return an error for a password that is not correct for the given email', () => {
    const wrongPassword = 'abcde12345' + 'a';
    expect(adminAuthLogin('evan.xiong@unsw.edu.au', wrongPassword)).toStrictEqual(ERROR);
  });

  test.failing('Correctly returns their sessionId', () => {
    expect(adminAuthLogin('evan.xiong@unsw.edu.au', 'abcde12345')).toStrictEqual(SUCCESSFULLOGIN);
  });
});

test.failing('Correctly returns two sessionId', () => {
  const Id1 = ok(adminAuthRegister(
    'evan.xiong@unsw.edu.au', 
    'abcde12345', 'Evan', 'Xiong'));
  const Id2 = ok(adminAuthRegister(
    'jessie.zhang@unsw.edu.au', 
    'qwerty67890', 'Jessie', 'Zhang'));
  expect(adminAuthLogin('evan.xiong@unsw.edu.au', 'abcde12345')).toStrictEqual(SUCCESSFULLOGIN);
  expect(adminAuthLogin('jessie.zhang@unsw.edu.au', 'qwerty67890')).toStrictEqual(SUCCESSFULLOGIN);
  expect(Id1).not.toStrictEqual(expect(Id2));
});

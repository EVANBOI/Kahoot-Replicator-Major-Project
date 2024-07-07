import { adminAuthRegister } from '../wrappers';
import { clear } from '../wrappers';

const REGISTRATED = { sessionId: expect.any(String) };
const ERROR = { error: expect.any(String) };

const VALID_INPUTS = {
  EMAIL: 'admin@email.com',
  PASSWORD: 'password1',
  FIRSTNAME: 'Idk',
  LASTNAME: 'Idk'
};

beforeEach(() => {
  clear();
});

describe('Successful registration tests', () => {
  test('All inputs are valid', () => {
    expect(adminAuthRegister(VALID_INPUTS.EMAIL,
      VALID_INPUTS.PASSWORD,
      VALID_INPUTS.FIRSTNAME,
      VALID_INPUTS.LASTNAME)).toStrictEqual(REGISTRATED);
  });

  test('Check generated ids are unique', () => {
    const user1 = adminAuthRegister('admin1@email.com',
      VALID_INPUTS.PASSWORD,
      VALID_INPUTS.FIRSTNAME,
      VALID_INPUTS.LASTNAME);
    const user2 = adminAuthRegister('admin2@email.com',
      VALID_INPUTS.PASSWORD,
      VALID_INPUTS.FIRSTNAME,
      VALID_INPUTS.LASTNAME);
    expect(user1).not.toStrictEqual(user2);
  });

  describe('More cases for successful name tests', () => {
    test.each([
      {
        testName: 'First name with hyphen',
        nameFirst: 'Hello-',
        nameLast: VALID_INPUTS.LASTNAME
      },
      {
        testName: 'First name with apostrophe',
        nameFirst: "He''llo",
        nameLast: VALID_INPUTS.LASTNAME
      },
      {
        testName: 'First name with space',
        nameFirst: 'He llo',
        nameLast: VALID_INPUTS.LASTNAME
      },
      {
        testName: 'Last name with hyphen',
        nameFirst: VALID_INPUTS.FIRSTNAME,
        nameLast: '-woah'
      },
      {
        testName: 'Last name with space',
        nameFirst: VALID_INPUTS.FIRSTNAME,
        nameLast: 'w oah'
      },
      {
        testName: 'Last name with apostrophe',
        nameFirst: VALID_INPUTS.FIRSTNAME,
        nameLast: "'He'l'lo"
      }
    ])('Test $#: $testName', ({ nameFirst, nameLast }) => {
      expect(adminAuthRegister(VALID_INPUTS.EMAIL,
        VALID_INPUTS.PASSWORD,
        nameFirst,
        nameLast)).toStrictEqual(REGISTRATED);
    });
  });
});

describe('Unsuccessful email tests', () => {
  test('Repeated email', () => {
    adminAuthRegister(VALID_INPUTS.EMAIL,
      VALID_INPUTS.PASSWORD,
      VALID_INPUTS.FIRSTNAME,
      VALID_INPUTS.LASTNAME);
    expect(adminAuthRegister(VALID_INPUTS.EMAIL,
      VALID_INPUTS.PASSWORD,
      VALID_INPUTS.FIRSTNAME,
      VALID_INPUTS.LASTNAME)).toStrictEqual(ERROR);
  });
  test('Input is not an email', () => {
    expect(adminAuthRegister('123',
      VALID_INPUTS.PASSWORD,
      VALID_INPUTS.FIRSTNAME,
      VALID_INPUTS.LASTNAME)).toStrictEqual(ERROR);
  });
});

describe('Unsuccesful name tests', () => {
  test.each([
    {
      testName: 'First name with number',
      nameFirst: 'J23',
      nameLast: VALID_INPUTS.LASTNAME
    },
    {
      testName: 'First name with symbols',
      nameFirst: 'He@l+o',
      nameLast: VALID_INPUTS.LASTNAME
    },
    {
      testName: 'First name is less than 2 characters',
      nameFirst: 'J',
      nameLast: VALID_INPUTS.LASTNAME
    },
    {
      testName: 'First name is more than 20 characters',
      nameFirst: 'a'.repeat(30),
      nameLast: VALID_INPUTS.LASTNAME
    },
    {
      testName: 'Last name with number',
      nameFirst: VALID_INPUTS.FIRSTNAME,
      nameLast: 'Z00k'
    },
    {
      testName: 'Last name with full stop',
      nameFirst: VALID_INPUTS.FIRSTNAME,
      nameLast: 'w, oa.h'
    },
    {
      testName: 'Last name is less than 2 characters',
      nameFirst: VALID_INPUTS.FIRSTNAME,
      nameLast: 'J'
    },
    {
      testName: 'Last name is more than 20 characters',
      nameFirst: VALID_INPUTS.FIRSTNAME,
      nameLast: 'a'.repeat(30)
    }
  ])('Test $#: $testName', ({ nameFirst, nameLast }) => {
    expect(adminAuthRegister(VALID_INPUTS.EMAIL,
      VALID_INPUTS.PASSWORD,
      nameFirst,
      nameLast)).toStrictEqual(ERROR);
  });
});

describe('Unsuccessful password tests', () => {
  test.each([
    {
      testName: 'Password with only letters',
      password: 'password'
    },
    {
      testName: 'Password with only numbers',
      password: '12345678'
    },
    {
      testName: 'Password with less than 8 characters',
      password: 'pass1'
    },
    {
      testName: 'Password with less than 8 characters and only letters',
      password: 'pass'
    }
  ])('Test $#: $testName', ({ password }) => {
    expect(adminAuthRegister(VALID_INPUTS.EMAIL,
      password,
      VALID_INPUTS.FIRSTNAME,
      VALID_INPUTS.LASTNAME)).toStrictEqual(ERROR);
  });
});

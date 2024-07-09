import { adminAuthRegister, adminUserDetailsUpdate, adminUserDetails, clear } from '../wrappers';

const VALID_INPUTS_1 = {
  EMAIL: 'admin@email.com',
  PASSWORD: 'password1',
  FIRSTNAME: 'Idk',
  LASTNAME: 'Idk',
};

const VALID_INPUTS_2 = {
  EMAIL: 'user@email.com',
  PASSWORD: 'password1',
  FIRSTNAME: 'Idk',
  LASTNAME: 'Idk',
};

const SUCCESSFULUPDATED = {
  statusCode: 200,
  jsonBody: {}
};

const ERROR401 = {
  statusCode: 401,
  jsonBody: { error: expect.any(String) }
};

const ERROR400 = {
  statusCode: 400,
  jsonBody: { error: expect.any(String) }
};

const NEW_VALID_EMAIL = 'newValidEmail@gmail.com';
let VALID_TOKEN: string;

beforeEach(() => {
  clear();
});

describe('error tests', () => {
  beforeEach(() => {
    const register = adminAuthRegister(
      VALID_INPUTS_1.EMAIL,
      VALID_INPUTS_1.PASSWORD,
      VALID_INPUTS_1.FIRSTNAME,
      VALID_INPUTS_1.LASTNAME
    );
    VALID_TOKEN = register.jsonBody.sessionId;
  });

  test('UserId is not a valid user', () => {
    const INVALID_TOKEN = VALID_TOKEN + 1;
    expect(adminUserDetailsUpdate(
      INVALID_TOKEN,
      NEW_VALID_EMAIL,
      VALID_INPUTS_1.FIRSTNAME,
      VALID_INPUTS_1.LASTNAME)
    ).toStrictEqual(ERROR401);
  });

  test('Email is currently used by another user', () => {
    adminAuthRegister(
      VALID_INPUTS_2.EMAIL,
      VALID_INPUTS_2.PASSWORD,
      VALID_INPUTS_2.FIRSTNAME,
      VALID_INPUTS_2.LASTNAME
    );
    expect(adminUserDetailsUpdate(
      VALID_TOKEN,
      VALID_INPUTS_2.EMAIL,
      VALID_INPUTS_1.FIRSTNAME,
      VALID_INPUTS_1.LASTNAME)
    ).toStrictEqual(ERROR400);
  });

  test('Email is invalid', () => {
    const INVALID_EMAIL = 'INVALIDEMAIL';
    expect(adminUserDetailsUpdate(
      VALID_TOKEN,
      INVALID_EMAIL,
      VALID_INPUTS_1.FIRSTNAME,
      VALID_INPUTS_1.LASTNAME)
    ).toStrictEqual(ERROR400);
  });

  test('First name has invalid letter', () => {
    const INVALID_FIRSTNAME = '!Invalid*Name';
    expect(adminUserDetailsUpdate(
      VALID_TOKEN,
      NEW_VALID_EMAIL,
      INVALID_FIRSTNAME,
      VALID_INPUTS_1.LASTNAME)
    ).toStrictEqual(ERROR400);
  });

  test('Last name has invalid letter', () => {
    const INVALID_LASTNAME = '!Invalid*Name';
    expect(adminUserDetailsUpdate(
      VALID_TOKEN,
      NEW_VALID_EMAIL,
      VALID_INPUTS_1.FIRSTNAME,
      INVALID_LASTNAME)
    ).toStrictEqual(ERROR400);
  });

  test.each([
    {
      error: 'First name too long',
      nameFirst: 'l'.repeat(30),
      nameLast: VALID_INPUTS_1.LASTNAME
    },
    {
      error: 'First name too short',
      nameFirst: 's',
      nameLast: VALID_INPUTS_1.LASTNAME
    },
    {
      error: 'Last name too short',
      nameFirst: VALID_INPUTS_1.FIRSTNAME,
      nameLast: 's'
    },
    {
      error: 'Last name too long',
      nameFirst: VALID_INPUTS_1.FIRSTNAME,
      nameLast: 'l'.repeat(30)
    },
  ])('$error', ({ nameFirst, nameLast }) => {
    expect(adminUserDetailsUpdate(VALID_TOKEN, NEW_VALID_EMAIL, nameFirst, nameLast)).toStrictEqual(ERROR400);
  });
});

describe('Successful update', () => {
  beforeEach(() => {
    const register = adminAuthRegister(
      VALID_INPUTS_1.EMAIL,
      VALID_INPUTS_1.PASSWORD,
      VALID_INPUTS_1.FIRSTNAME,
      VALID_INPUTS_1.LASTNAME
    );
    VALID_TOKEN = register.jsonBody.sessionId;
  });

  test('correct return value', () => {
    expect(adminUserDetailsUpdate(
      VALID_TOKEN,
      NEW_VALID_EMAIL,
      VALID_INPUTS_1.FIRSTNAME,
      VALID_INPUTS_1.LASTNAME)
    ).toStrictEqual(SUCCESSFULUPDATED);
  });
});

test.failing('correct update First name with all valid letters', () => {
  expect(adminUserDetailsUpdate(
    VALID_TOKEN,
    VALID_INPUTS_1.EMAIL,
    "ValidFN-' ",
    VALID_INPUTS_1.LASTNAME)).toStrictEqual({ });
  expect(adminUserDetails(VALID_TOKEN)).toStrictEqual({
    statusCode: 200,
    jsonBody: {
      user: {
        userId: expect.any(Number),
        name: `ValidFN-'  ${VALID_INPUTS_1.LASTNAME}`,
        email: VALID_INPUTS_1.EMAIL,
        numSuccessfulLogins: expect.any(Number),
        numFailedPasswordsSinceLastLogin: expect.any(Number),
      }
    }
  });
});

test.failing('correct update Last name with all valid letters', () => {
  adminUserDetailsUpdate(VALID_TOKEN, VALID_INPUTS_1.EMAIL, VALID_INPUTS_1.FIRSTNAME, "ValidFN-' ");
  expect(adminUserDetails(VALID_TOKEN)).toStrictEqual({
    statusCode: 200,
    jsonBody: {
      user: {
        userId: expect.any(Number),
        name: `${VALID_INPUTS_1.FIRSTNAME} ValidFN-' `,
        email: VALID_INPUTS_1.EMAIL,
        numSuccessfulLogins: expect.any(Number),
        numFailedPasswordsSinceLastLogin: expect.any(Number),
      }
    }
  });
});

test.failing('correct update New email', () => {
  adminUserDetailsUpdate(VALID_TOKEN, NEW_VALID_EMAIL, VALID_INPUTS_1.FIRSTNAME, VALID_INPUTS_1.LASTNAME);
  expect(adminUserDetails(VALID_TOKEN)).toStrictEqual({
    statusCode: 200,
    jsonBody: {
      user: {
        userId: expect.any(Number),
        name: `${VALID_INPUTS_1.FIRSTNAME} ${VALID_INPUTS_1.LASTNAME}`,
        email: NEW_VALID_EMAIL,
        numSuccessfulLogins: expect.any(Number),
        numFailedPasswordsSinceLastLogin: expect.any(Number),
      }
    }
  });
});

test.failing('correct runing but still be old email', () => {
  adminUserDetailsUpdate(VALID_TOKEN, VALID_INPUTS_1.EMAIL, VALID_INPUTS_1.FIRSTNAME, VALID_INPUTS_1.LASTNAME);
  expect(adminUserDetails(VALID_TOKEN)).toStrictEqual({
    statusCode: 200,
    jsonBody: {
      user: {
        userId: expect.any(Number),
        name: `${VALID_INPUTS_1.FIRSTNAME} ${VALID_INPUTS_1.LASTNAME}`,
        email: VALID_INPUTS_1.EMAIL,
        numSuccessfulLogins: expect.any(Number),
        numFailedPasswordsSinceLastLogin: expect.any(Number),
      }
    }
  });
});

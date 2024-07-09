import { clear, adminAuthRegister, adminUserDetails, adminQuizCreate, adminQuizInfo } from '../wrappers';

const SUCCESSFULCLEAR = {
  statusCode: 200,
  jsonBody: {}
};

const VALID_USER = {
  EMAIL: 'admin@email.com',
  PASSWORD: 'password1',
  FIRSTNAME: 'Idk',
  LASTNAME: 'Idk',
};

const VALID_QUIZ = {
  NAME: 'ValidQuizName',
  DESCRIPTION: 'ValidDescription'
};

const ERROR401 = {
  statusCode: 401,
  jsonBody: { error: expect.any(String) }
};

describe('Function clear tests', () => {
  test('correct return value check', () => {
    expect(clear()).toEqual(SUCCESSFULCLEAR);
  });

  test.failing('correct clear the user store', () => {
    const register = adminAuthRegister(
      VALID_USER.EMAIL,
      VALID_USER.PASSWORD,
      VALID_USER.FIRSTNAME,
      VALID_USER.LASTNAME
    );
    const VALID_TOKEN = register.jsonBody.token;
    clear();
    expect(adminUserDetails(VALID_TOKEN)).toStrictEqual(ERROR401);
  });

  test.failing('correct clear the quiz store', () => {
    const register = adminAuthRegister(
      VALID_USER.EMAIL,
      VALID_USER.PASSWORD,
      VALID_USER.FIRSTNAME,
      VALID_USER.LASTNAME
    );
    const VALID_TOKEN = register.jsonBody.token;
    const create = adminQuizCreate(
      VALID_TOKEN,
      VALID_QUIZ.NAME,
      VALID_QUIZ.DESCRIPTION
    );
    const VALID_QUIZ_ID = create.jsonBody.quizId;

    clear();
    expect(adminQuizInfo(VALID_TOKEN, VALID_QUIZ_ID)).toStrictEqual(ERROR401);
  });
});

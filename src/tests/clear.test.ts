import { clear } from '../wrappers';
import { adminAuthRegister, adminUserDetails } from '../auth';
import { adminQuizCreate, adminQuizInfo } from '../quiz';
import { QuizIdObject, Token } from '../types';

const CLEAR = {
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

const ERROR = {
  error: expect.any(String)
};

describe('Function clear tests', () => {
  test('correct return value check', () => {
    expect(clear()).toEqual(CLEAR);
  });

  test('correct clear the user store', () => {
    const register = adminAuthRegister(
      VALID_USER.EMAIL,
      VALID_USER.PASSWORD,
      VALID_USER.FIRSTNAME,
      VALID_USER.LASTNAME
    ) as Token;
    const VALID_TOKEN = register.token;
    clear();
    expect(adminUserDetails(VALID_TOKEN)).toStrictEqual(ERROR);
  });

  test('correct clear the quiz store', () => {
    const register = adminAuthRegister(
      VALID_USER.EMAIL,
      VALID_USER.PASSWORD,
      VALID_USER.FIRSTNAME,
      VALID_USER.LASTNAME
    ) as Token;
    const VALID_TOKEN = register.token;
    const create = adminQuizCreate(
      VALID_TOKEN,
      VALID_QUIZ.NAME,
      VALID_QUIZ.DESCRIPTION
    ) as QuizIdObject;
    const VALID_QUIZ_ID = create.quizId;

    clear();
    expect(adminQuizInfo(VALID_TOKEN, VALID_QUIZ_ID)).toStrictEqual(ERROR);
  });
});

import { clear } from '../other';
import { adminAuthRegister, adminUserDetails } from '../auth';
import { adminQuizCreate, adminQuizInfo } from '../quiz';
import { AuthUserIdObject, QuizIdObject } from '../types';


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
    expect(clear()).toEqual({});
  });

  test('correct clear the user store', () => {
    const register = adminAuthRegister(
      VALID_USER.EMAIL,
      VALID_USER.PASSWORD,
      VALID_USER.FIRSTNAME,
      VALID_USER.LASTNAME
    ) as AuthUserIdObject;
    const VALID_USER_ID = register.authUserId
    clear();
    expect(adminUserDetails(VALID_USER_ID)).toStrictEqual(ERROR);
  });

  test('correct clear the quiz store', () => {
    const register =  adminAuthRegister(
      VALID_USER.EMAIL,
      VALID_USER.PASSWORD,
      VALID_USER.FIRSTNAME,
      VALID_USER.LASTNAME
    ) as AuthUserIdObject;
    const VALID_USER_ID = register.authUserId;
    const create = adminQuizCreate(
      VALID_USER_ID,
      VALID_QUIZ.NAME,
      VALID_QUIZ.DESCRIPTION
    ) as QuizIdObject;
    const VALID_QUIZ_ID = create.quizId;

    clear();
    expect(adminQuizInfo(VALID_USER_ID, VALID_QUIZ_ID)).toStrictEqual(ERROR);
  });
});

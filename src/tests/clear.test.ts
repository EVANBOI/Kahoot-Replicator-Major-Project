import { clear, adminAuthRegister, adminUserDetails, adminQuizCreate, adminQuizInfo } from '../wrappers';
import { CLEAR_SUCCESSFUL, ERROR401, VALID_USER_REGISTER_INPUTS_1, VALID_QUIZ_CREATE_INPUTS_1 } from '../testConstants';

describe('Function clear tests', () => {
  test('correct return value check', () => {
    expect(clear()).toEqual(CLEAR_SUCCESSFUL);
  });

  test('correct clear the user store', () => {
    const register = adminAuthRegister(
      VALID_USER_REGISTER_INPUTS_1.EMAIL,
      VALID_USER_REGISTER_INPUTS_1.PASSWORD,
      VALID_USER_REGISTER_INPUTS_1.FIRSTNAME,
      VALID_USER_REGISTER_INPUTS_1.LASTNAME
    );
    const VALID_TOKEN = register.jsonBody.token;
    clear();
    expect(adminUserDetails(VALID_TOKEN)).toStrictEqual(ERROR401);
  });

  test('correct clear the quiz store', () => {
    const register = adminAuthRegister(
      VALID_USER_REGISTER_INPUTS_1.EMAIL,
      VALID_USER_REGISTER_INPUTS_1.PASSWORD,
      VALID_USER_REGISTER_INPUTS_1.FIRSTNAME,
      VALID_USER_REGISTER_INPUTS_1.LASTNAME
    );
    const VALID_TOKEN = register.jsonBody.token;
    const create = adminQuizCreate(
      VALID_TOKEN,
      VALID_QUIZ_CREATE_INPUTS_1.NAME,
      VALID_QUIZ_CREATE_INPUTS_1.DESCRIPTION
    );
    const VALID_QUIZ_ID = create.jsonBody.quizId;

    clear();
    expect(adminQuizInfo(VALID_TOKEN, VALID_QUIZ_ID)).toStrictEqual(ERROR401);
  });
});

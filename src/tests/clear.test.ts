import { clear, adminAuthRegister, adminQuizCreate, adminQuizInfo, adminUserDetailsV2, adminCreateQuizQuestionV2, adminQuizSessionStart, adminQuizSessionUpdate } from '../wrappers';
import { CLEAR_SUCCESSFUL, ERROR401, VALID_USER_REGISTER_INPUTS_1, VALID_QUIZ_CREATE_INPUTS_1, validQuestion1V2 } from '../testConstants';
import { getData } from '../dataStore';
import { SessionAction } from '../session';

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
    expect(adminUserDetailsV2(VALID_TOKEN)).toStrictEqual(ERROR401);
  });

  test('correct clear the quiz store', () => {
    const register = adminAuthRegister(
      VALID_USER_REGISTER_INPUTS_1.EMAIL,
      VALID_USER_REGISTER_INPUTS_1.PASSWORD,
      VALID_USER_REGISTER_INPUTS_1.FIRSTNAME,
      VALID_USER_REGISTER_INPUTS_1.LASTNAME
    );
    const VALID_TOKEN = register.jsonBody?.token;
    const create = adminQuizCreate(
      VALID_TOKEN,
      VALID_QUIZ_CREATE_INPUTS_1.NAME,
      VALID_QUIZ_CREATE_INPUTS_1.DESCRIPTION
    );
    const VALID_QUIZ_ID = create.jsonBody?.quizId;

    clear();
    expect(adminQuizInfo(VALID_TOKEN, VALID_QUIZ_ID)).toStrictEqual(ERROR401);
  });

  test.failing('Correct clear the timerId', () => {
    const token1 = adminAuthRegister(
      'admin1@gmail.com', 'SDFJKH2349081j', 'JJone', 'ZZ'
    ).jsonBody.token;
    const quizId1 = adminQuizCreate(token1, 'Quiz 1', '1st description').jsonBody.quizId;
    adminCreateQuizQuestionV2(quizId1, token1, validQuestion1V2);
    const sessionId1 = adminQuizSessionStart(quizId1, token1, 5).jsonBody.sessionId;
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
    clear();
    const updatedStore = getData();
    expect(updatedStore.sessionIdToTimerObject[sessionId1]).toBeUndefined();
  });
});

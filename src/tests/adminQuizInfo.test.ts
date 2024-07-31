import {
  adminAuthRegister,
  adminQuizInfo,
  adminQuizInfoV2,
  adminQuizCreate,
  clear
} from '../wrappers';
import {
  ERROR403,
  ERROR401,
  VALID_USER_REGISTER_INPUTS_1,
  VALID_QUIZ_CREATE_INPUTS_1
} from '../testConstants';

let VALID_TOKEN: string;
let VALID_QUIZ_ID: number;

beforeEach(() => {
  clear();
});

describe('/v1/admin/quiz/{quizid}', () => {
  describe('error tests', () => {
    beforeEach(() => {
      const register = adminAuthRegister(
        VALID_USER_REGISTER_INPUTS_1.EMAIL,
        VALID_USER_REGISTER_INPUTS_1.PASSWORD,
        VALID_USER_REGISTER_INPUTS_1.FIRSTNAME,
        VALID_USER_REGISTER_INPUTS_1.LASTNAME
      );
      VALID_TOKEN = register.jsonBody?.token;
    });

    test('AuthUserId is not a valid user.', () => {
      expect(adminQuizInfo(VALID_TOKEN + 1, VALID_QUIZ_ID)).toStrictEqual(ERROR401);
    });

    test('QuizId is not a valid quiz.', () => {
      expect(adminQuizInfo(VALID_TOKEN, VALID_QUIZ_ID + 1)).toStrictEqual(ERROR403);
    });

    test('Visitor is not creator', () => {
      const newQuiz = adminQuizCreate(VALID_TOKEN, VALID_QUIZ_CREATE_INPUTS_1.NAME, VALID_QUIZ_CREATE_INPUTS_1.DESCRIPTION);
      VALID_QUIZ_ID = newQuiz.jsonBody?.quizId;
      const otherUser = adminAuthRegister(
        'validAnotherEmail@gmail.com',
        VALID_USER_REGISTER_INPUTS_1.PASSWORD,
        VALID_USER_REGISTER_INPUTS_1.FIRSTNAME,
        VALID_USER_REGISTER_INPUTS_1.LASTNAME
      );
      const ANOTHETR_SESSION_ID = otherUser.jsonBody?.token;
      expect(adminQuizInfo(ANOTHETR_SESSION_ID, VALID_QUIZ_ID)).toStrictEqual(ERROR403);
    });
  });

  describe('success tests', () => {
    beforeEach(() => {
      const User = adminAuthRegister(
        VALID_USER_REGISTER_INPUTS_1.EMAIL,
        VALID_USER_REGISTER_INPUTS_1.PASSWORD,
        VALID_USER_REGISTER_INPUTS_1.FIRSTNAME,
        VALID_USER_REGISTER_INPUTS_1.LASTNAME
      );
      VALID_TOKEN = User.jsonBody?.token;
      const Quiz = adminQuizCreate(
        VALID_TOKEN,
        VALID_QUIZ_CREATE_INPUTS_1.NAME,
        VALID_QUIZ_CREATE_INPUTS_1.DESCRIPTION
      );
      VALID_QUIZ_ID = Quiz.jsonBody?.quizId;
    });

    test('correct return value', () => {
      expect(adminQuizInfo(VALID_TOKEN, VALID_QUIZ_ID)).toStrictEqual({
        statusCode: 200,
        jsonBody: {
          quizId: VALID_QUIZ_ID,
          name: VALID_QUIZ_CREATE_INPUTS_1.NAME,
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: VALID_QUIZ_CREATE_INPUTS_1.DESCRIPTION,
          numQuestions: 0,
          questions: [],
          duration: expect.any(Number)
        }
      });
    });
  });
});

describe('/v2/admin/quiz/{quizid}', () => {
  describe('error tests', () => {
    beforeEach(() => {
      const register = adminAuthRegister(
        VALID_USER_REGISTER_INPUTS_1.EMAIL,
        VALID_USER_REGISTER_INPUTS_1.PASSWORD,
        VALID_USER_REGISTER_INPUTS_1.FIRSTNAME,
        VALID_USER_REGISTER_INPUTS_1.LASTNAME
      );
      VALID_TOKEN = register.jsonBody?.token;
    });

    test('AuthUserId is not a valid user.', () => {
      expect(adminQuizInfoV2(VALID_TOKEN + 1, VALID_QUIZ_ID)).toStrictEqual(ERROR401);
    });

    test('QuizId is not a valid quiz.', () => {
      expect(adminQuizInfoV2(VALID_TOKEN, VALID_QUIZ_ID + 1)).toStrictEqual(ERROR403);
    });

    test('Visitor is not creator', () => {
      const newQuiz = adminQuizCreate(VALID_TOKEN, VALID_QUIZ_CREATE_INPUTS_1.NAME, VALID_QUIZ_CREATE_INPUTS_1.DESCRIPTION);
      VALID_QUIZ_ID = newQuiz.jsonBody?.quizId;
      const otherUser = adminAuthRegister(
        'validAnotherEmail@gmail.com',
        VALID_USER_REGISTER_INPUTS_1.PASSWORD,
        VALID_USER_REGISTER_INPUTS_1.FIRSTNAME,
        VALID_USER_REGISTER_INPUTS_1.LASTNAME
      );
      const ANOTHETR_SESSION_ID = otherUser.jsonBody?.token;
      expect(adminQuizInfoV2(ANOTHETR_SESSION_ID, VALID_QUIZ_ID)).toStrictEqual(ERROR403);
    });
  });

  describe('success tests', () => {
    beforeEach(() => {
      const User = adminAuthRegister(
        VALID_USER_REGISTER_INPUTS_1.EMAIL,
        VALID_USER_REGISTER_INPUTS_1.PASSWORD,
        VALID_USER_REGISTER_INPUTS_1.FIRSTNAME,
        VALID_USER_REGISTER_INPUTS_1.LASTNAME
      );
      VALID_TOKEN = User.jsonBody?.token;
      const Quiz = adminQuizCreate(
        VALID_TOKEN,
        VALID_QUIZ_CREATE_INPUTS_1.NAME,
        VALID_QUIZ_CREATE_INPUTS_1.DESCRIPTION
      );
      VALID_QUIZ_ID = Quiz.jsonBody?.quizId;
    });

    test('correct return value', () => {
      expect(adminQuizInfoV2(VALID_TOKEN, VALID_QUIZ_ID)).toStrictEqual({
        statusCode: 200,
        jsonBody: {
          quizId: VALID_QUIZ_ID,
          name: VALID_QUIZ_CREATE_INPUTS_1.NAME,
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: VALID_QUIZ_CREATE_INPUTS_1.DESCRIPTION,
          numQuestions: 0,
          questions: [],
          duration: expect.any(Number)
        }
      });
    });
  });
});

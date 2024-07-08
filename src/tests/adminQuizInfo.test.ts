import { adminAuthRegister, adminQuizInfo, adminQuizCreate, clear } from '../wrappers';

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

let VALID_TOKEN: string;
let VALID_QUIZ_ID: number;

const ERROR401 = {
  statusCode: 401,
  jsonBody: { error: expect.any(String) }
};

const ERROR403 = {
  statusCode: 403,
  jsonBody: { error: expect.any(String) }
};

beforeEach(() => {
  clear();
});

describe('error tests', () => {
  beforeEach(() => {
    const register = adminAuthRegister(
      VALID_USER.EMAIL,
      VALID_USER.PASSWORD,
      VALID_USER.FIRSTNAME,
      VALID_USER.LASTNAME
    );
    VALID_TOKEN = register.jsonBody.sessionId;
  });

  test('AuthUserId is not a valid user.', () => {
    expect(adminQuizInfo(VALID_TOKEN + 1, VALID_QUIZ_ID)).toStrictEqual(ERROR401);
  });

  test('QuizId is not a valid quiz.', () => {
    expect(adminQuizInfo(VALID_TOKEN, VALID_QUIZ_ID + 1)).toStrictEqual(ERROR403);
  });

  test('Visitor is not creator', () => {
    const newQuiz = adminQuizCreate(VALID_TOKEN, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION);
    VALID_QUIZ_ID = newQuiz.jsonBody.quizId;
    const otherUser = adminAuthRegister(
      'validAnotherEmail@gmail.com',
      VALID_USER.PASSWORD,
      VALID_USER.FIRSTNAME,
      VALID_USER.LASTNAME
    );
    const ANOTHETR_SESSION_ID = otherUser.jsonBody.sessionId;
    expect(adminQuizInfo(ANOTHETR_SESSION_ID, VALID_QUIZ_ID)).toStrictEqual(ERROR403);
  });
});

describe('success tests', () => {
  beforeEach(() => {
    const User = adminAuthRegister(
      VALID_USER.EMAIL,
      VALID_USER.PASSWORD,
      VALID_USER.FIRSTNAME,
      VALID_USER.LASTNAME
    );
    VALID_TOKEN = User.jsonBody.sessionId;
    const Quiz = adminQuizCreate(
      VALID_TOKEN,
      VALID_QUIZ.NAME,
      VALID_QUIZ.DESCRIPTION
    );
    VALID_QUIZ_ID = Quiz.jsonBody.quizId;
  });

  test('correct return value', () => {
    expect(adminQuizInfo(VALID_TOKEN, VALID_QUIZ_ID)).toStrictEqual({
      statusCode: 200,
      jsonBody: {
        quizId: VALID_QUIZ_ID,
        name: VALID_QUIZ.NAME,
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: VALID_QUIZ.DESCRIPTION,
      }
    });
  });
});

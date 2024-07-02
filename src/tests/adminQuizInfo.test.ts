import { adminAuthRegister } from '../auth';
import { adminQuizCreate, adminQuizInfo } from '../quiz';
import { clear } from '../other';
import { QuizIdObject, SessionId } from '../types';

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

let VALID_TOKEN: number;
let VALID_QUIZ_ID: number;

const ERROR = {
  error: expect.any(String)
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
    ) as SessionId;
    VALID_TOKEN = register.sessionId;
  });

  test('AuthUserId is not a valid user.', () => {
    expect(adminQuizInfo(VALID_TOKEN + 1, VALID_QUIZ_ID)).toStrictEqual(ERROR);
  });

  test('QuizId is not a valid quiz.', () => {
    expect(adminQuizInfo(VALID_TOKEN, VALID_QUIZ_ID + 1)).toStrictEqual(ERROR);
  });

  test('Visitor is not creator', () => {
    const newQuiz = adminQuizCreate(VALID_TOKEN, VALID_QUIZ.NAME, VALID_QUIZ.DESCRIPTION) as QuizIdObject;
    VALID_QUIZ_ID = newQuiz.quizId;
    const otherUser = adminAuthRegister(
      'validAnotherEmail@gmail.com',
      VALID_USER.PASSWORD,
      VALID_USER.FIRSTNAME,
      VALID_USER.LASTNAME
    ) as SessionId;
    const ANOTHETR_SESSION_ID = otherUser.sessionId;
    expect(adminQuizInfo(ANOTHETR_SESSION_ID, VALID_QUIZ_ID)).toStrictEqual(ERROR);
  });
});

describe('success tests', () => {
  beforeEach(() => {
    const User = adminAuthRegister(
      VALID_USER.EMAIL,
      VALID_USER.PASSWORD,
      VALID_USER.FIRSTNAME,
      VALID_USER.LASTNAME
    ) as SessionId;
    VALID_TOKEN = User.sessionId;
    const Quiz = adminQuizCreate(
      VALID_TOKEN,
      VALID_QUIZ.NAME,
      VALID_QUIZ.DESCRIPTION
    ) as QuizIdObject;
    VALID_QUIZ_ID = Quiz.quizId;
  });

  test('correct return value', () => {
    expect(adminQuizInfo(VALID_TOKEN, VALID_QUIZ_ID)).toStrictEqual({
      quizId: VALID_QUIZ_ID,
      name: VALID_QUIZ.NAME,
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: VALID_QUIZ.DESCRIPTION,
    });
  });
});

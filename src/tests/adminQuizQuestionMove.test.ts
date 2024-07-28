import { clear, adminAuthRegister, adminQuizCreate, adminQuizQuestionMove, adminQuizQuestionMoveV2, adminCreateQuizQuestion, adminQuizInfo } from '../wrappers';
import {
  ERROR400, ERROR403, ERROR401, VALID_USER_REGISTER_INPUTS_1, VALID_USER_REGISTER_INPUTS_2,
  VALID_QUIZ_CREATE_INPUTS_1, validQuestion1, validQuestion3, QUIZ_QUESTION_MOVED_SUCCESSFUL
} from '../testConstants';
import { QuestionBody, PositionWithTokenObj, PositionObj } from '../types';

let VALID_TOKEN: string;
let INVALID_TOKEN: string;
let VALID_QUIZ_ID: number;
let INVALID_QUIZ_ID: number;
let VALID_QUESTION_ID0: number;
let VALID_QUESTION_ID1: number;
let INVALID_QUESTION_ID: number;
let MOVEINFO: PositionWithTokenObj;
let positionObj: PositionObj;

beforeEach(() => {
  clear();
});

describe('PUT /v1/admin/quiz/{quizid}/question/{questionid}/move', () => {
  describe('error tests', () => {
    beforeEach(() => {
      const register = adminAuthRegister(
        VALID_USER_REGISTER_INPUTS_1.EMAIL,
        VALID_USER_REGISTER_INPUTS_1.PASSWORD,
        VALID_USER_REGISTER_INPUTS_1.FIRSTNAME,
        VALID_USER_REGISTER_INPUTS_1.LASTNAME
      );
      VALID_TOKEN = register.jsonBody.token;
      const newQuiz = adminQuizCreate(
        VALID_TOKEN,
        VALID_QUIZ_CREATE_INPUTS_1.NAME,
        VALID_QUIZ_CREATE_INPUTS_1.DESCRIPTION
      );
      VALID_QUIZ_ID = newQuiz.jsonBody.quizId;
      const Question = adminCreateQuizQuestion(
        VALID_QUIZ_ID,
        VALID_TOKEN,
        validQuestion1
      );
      VALID_QUESTION_ID0 = Question.jsonBody.questionId;
      const Question2 = adminCreateQuizQuestion(
        VALID_QUIZ_ID,
        VALID_TOKEN,
        validQuestion3
      );
      VALID_QUESTION_ID1 = Question2.jsonBody.questionId;
      INVALID_TOKEN = VALID_TOKEN + 1;
      INVALID_QUIZ_ID = VALID_QUIZ_ID + 1;
      INVALID_QUESTION_ID = VALID_QUESTION_ID0 + VALID_QUESTION_ID1 + 9999;
    });
    describe('ERROR-401 (Token invalid)', () => {
      test('Token is invalid with other valid', () => {
        MOVEINFO = {
          token: INVALID_TOKEN,
          newPosition: 1
        };
        expect(adminQuizQuestionMove(VALID_QUIZ_ID, VALID_QUESTION_ID0, MOVEINFO)).toStrictEqual(ERROR401);
      });
      test('Token and quizId are invalid', () => {
        MOVEINFO = {
          token: INVALID_TOKEN,
          newPosition: 1
        };
        expect(adminQuizQuestionMove(INVALID_QUIZ_ID, VALID_QUESTION_ID0, MOVEINFO)).toStrictEqual(ERROR401);
      });
      test('Token, quizId and questionId are invalid', () => {
        MOVEINFO = {
          token: INVALID_TOKEN,
          newPosition: 1
        };
        expect(adminQuizQuestionMove(INVALID_QUIZ_ID, INVALID_QUESTION_ID, MOVEINFO)).toStrictEqual(ERROR401);
      });
      test('Token, quizId, questionId and position are invalid', () => {
        MOVEINFO = {
          token: INVALID_TOKEN,
          newPosition: 5
        };
        expect(adminQuizQuestionMove(INVALID_QUIZ_ID, INVALID_QUESTION_ID, MOVEINFO)).toStrictEqual(ERROR401);
      });
    });
    describe('ERROR-403 (Token valid)', () => {
      test('Token is valid, but quiz doesn\'t exist', () => {
        MOVEINFO = {
          token: VALID_TOKEN,
          newPosition: 1
        };
        expect(adminQuizQuestionMove(INVALID_QUIZ_ID, VALID_QUESTION_ID0, MOVEINFO)).toStrictEqual(ERROR403);
      });
      test('Token and QuizId are valid, but user is not an owner of this quiz', () => {
        const register2 = adminAuthRegister(
          VALID_USER_REGISTER_INPUTS_2.EMAIL,
          VALID_USER_REGISTER_INPUTS_2.PASSWORD,
          VALID_USER_REGISTER_INPUTS_2.FIRSTNAME,
          VALID_USER_REGISTER_INPUTS_2.LASTNAME
        );
        const VALID_TOKEN2 = register2.jsonBody.token;
        MOVEINFO = {
          token: VALID_TOKEN2,
          newPosition: 1
        };
        expect(adminQuizQuestionMove(VALID_QUIZ_ID, VALID_QUESTION_ID0, MOVEINFO)).toStrictEqual(ERROR403);
      });
      test('Token is valid, but quizId and questionId are invalid', () => {
        MOVEINFO = {
          token: VALID_TOKEN,
          newPosition: 1
        };
        expect(adminQuizQuestionMove(INVALID_QUIZ_ID, INVALID_QUESTION_ID, MOVEINFO)).toStrictEqual(ERROR403);
      });
      test('Token is valid, but quizId, questionId and position are invalid', () => {
        MOVEINFO = {
          token: VALID_TOKEN,
          newPosition: 5
        };
        expect(adminQuizQuestionMove(INVALID_QUIZ_ID, INVALID_QUESTION_ID, MOVEINFO)).toStrictEqual(ERROR403);
      });
    });
    describe('ERROR-400 (Token and quizId are valid)', () => {
      test('Question Id does not refer to a valid question within this quiz', () => {
        MOVEINFO = {
          token: VALID_TOKEN,
          newPosition: 1
        };
        expect(adminQuizQuestionMove(VALID_QUIZ_ID, INVALID_QUESTION_ID, MOVEINFO)).toStrictEqual(ERROR400);
      });
      test('NewPosition is less than 0, or NewPosition is greater than n-1 where n is the number of questions', () => {
        MOVEINFO = {
          token: VALID_TOKEN,
          newPosition: -1
        };
        expect(adminQuizQuestionMove(VALID_QUIZ_ID, VALID_QUESTION_ID0, MOVEINFO)).toStrictEqual(ERROR400);
      });
      test('NewPosition is the position of the current question', () => {
        MOVEINFO = {
          token: VALID_TOKEN,
          newPosition: 0
        };
        expect(adminQuizQuestionMove(VALID_QUIZ_ID, VALID_QUESTION_ID0, MOVEINFO)).toStrictEqual(ERROR400);
      });
    });
  });

  describe('successful test', () => {
    beforeEach(() => {
      const register = adminAuthRegister(
        VALID_USER_REGISTER_INPUTS_1.EMAIL,
        VALID_USER_REGISTER_INPUTS_1.PASSWORD,
        VALID_USER_REGISTER_INPUTS_1.FIRSTNAME,
        VALID_USER_REGISTER_INPUTS_1.LASTNAME
      );
      VALID_TOKEN = register.jsonBody.token;
      const newQuiz = adminQuizCreate(
        VALID_TOKEN,
        VALID_QUIZ_CREATE_INPUTS_1.NAME,
        VALID_QUIZ_CREATE_INPUTS_1.DESCRIPTION
      );
      VALID_QUIZ_ID = newQuiz.jsonBody.quizId;
      const Question = adminCreateQuizQuestion(
        VALID_QUIZ_ID,
        VALID_TOKEN,
        validQuestion1
      );
      VALID_QUESTION_ID0 = Question.jsonBody.questionId;
      const Question2 = adminCreateQuizQuestion(
        VALID_QUIZ_ID,
        VALID_TOKEN,
        validQuestion3
      );
      VALID_QUESTION_ID1 = Question2.jsonBody.questionId;
      MOVEINFO = {
        token: VALID_TOKEN,
        newPosition: 1
      };
    });
    test('return value successful', () => {
      expect(adminQuizQuestionMove(
        VALID_QUIZ_ID,
        VALID_QUESTION_ID0,
        MOVEINFO)
      ).toStrictEqual(QUIZ_QUESTION_MOVED_SUCCESSFUL);
    });
    test('move question successful', () => {
      let questions:QuestionBody[] = adminQuizInfo(VALID_TOKEN, VALID_QUIZ_ID).jsonBody.questions;
      let index = questions.findIndex(question => question.questionId === VALID_QUESTION_ID0);
      expect(index).toStrictEqual(0);
      adminQuizQuestionMove(VALID_QUIZ_ID, VALID_QUESTION_ID0, MOVEINFO);
      questions = adminQuizInfo(VALID_TOKEN, VALID_QUIZ_ID).jsonBody.questions;
      index = questions.findIndex(question => question.questionId === VALID_QUESTION_ID0);
      expect(index).toStrictEqual(1);
    });
    test('timeLastEdited is updated', () => {
      const unmodifiedTimeLastEdited: number = adminQuizInfo(VALID_TOKEN, VALID_QUIZ_ID).jsonBody.timeLastEdited;
      adminQuizQuestionMove(VALID_QUIZ_ID, VALID_QUESTION_ID0, MOVEINFO);
      const modifiedTimeLastEdited: number = adminQuizInfo(VALID_TOKEN, VALID_QUIZ_ID).jsonBody.timeLastEdited;
      // time change of timeLastEdited is too small to check
      // the solution from the Ed forum
      expect(modifiedTimeLastEdited).toBeGreaterThanOrEqual(unmodifiedTimeLastEdited);
    });
  });
});

describe('PUT /v2/admin/quiz/{quizid}/question/{questionid}/move', () => {
  describe('error tests', () => {
    beforeEach(() => {
      const register = adminAuthRegister(
        VALID_USER_REGISTER_INPUTS_1.EMAIL,
        VALID_USER_REGISTER_INPUTS_1.PASSWORD,
        VALID_USER_REGISTER_INPUTS_1.FIRSTNAME,
        VALID_USER_REGISTER_INPUTS_1.LASTNAME
      );
      VALID_TOKEN = register.jsonBody.token;
      const newQuiz = adminQuizCreate(
        VALID_TOKEN,
        VALID_QUIZ_CREATE_INPUTS_1.NAME,
        VALID_QUIZ_CREATE_INPUTS_1.DESCRIPTION
      );
      VALID_QUIZ_ID = newQuiz.jsonBody.quizId;
      const Question = adminCreateQuizQuestion(
        VALID_QUIZ_ID,
        VALID_TOKEN,
        validQuestion1
      );
      VALID_QUESTION_ID0 = Question.jsonBody.questionId;
      const Question2 = adminCreateQuizQuestion(
        VALID_QUIZ_ID,
        VALID_TOKEN,
        validQuestion3
      );
      VALID_QUESTION_ID1 = Question2.jsonBody.questionId;
      INVALID_TOKEN = VALID_TOKEN + 1;
      INVALID_QUIZ_ID = VALID_QUIZ_ID + 1;
      INVALID_QUESTION_ID = VALID_QUESTION_ID0 + VALID_QUESTION_ID1 + 9999;
    });
    describe('ERROR-401 (Token invalid)', () => {
      test('Token is invalid with other valid', () => {
        positionObj = {
          newPosition: 1
        };
        expect(adminQuizQuestionMoveV2(VALID_QUIZ_ID, VALID_QUESTION_ID0, positionObj, INVALID_TOKEN)).toStrictEqual(ERROR401);
      });
      test('Token and quizId are invalid', () => {
        positionObj = {
          newPosition: 1
        };
        expect(adminQuizQuestionMoveV2(INVALID_QUIZ_ID, VALID_QUESTION_ID0, positionObj, INVALID_TOKEN)).toStrictEqual(ERROR401);
      });
      test('Token, quizId and questionId are invalid', () => {
        positionObj = {
          newPosition: 1
        };
        expect(adminQuizQuestionMoveV2(INVALID_QUIZ_ID, INVALID_QUESTION_ID, positionObj, INVALID_TOKEN)).toStrictEqual(ERROR401);
      });
      test('Token, quizId, questionId and position are invalid', () => {
        positionObj = {
          newPosition: 5
        };
        expect(adminQuizQuestionMoveV2(INVALID_QUIZ_ID, INVALID_QUESTION_ID, positionObj, INVALID_TOKEN)).toStrictEqual(ERROR401);
      });
    });
    describe('ERROR-403 (Token valid)', () => {
      test('Token is valid, but quiz doesn\'t exist', () => {
        positionObj = {
          newPosition: 1
        };
        expect(adminQuizQuestionMoveV2(INVALID_QUIZ_ID, VALID_QUESTION_ID0, positionObj, VALID_TOKEN)).toStrictEqual(ERROR403);
      });
      test('Token and QuizId are valid, but user is not an owner of this quiz', () => {
        const register2 = adminAuthRegister(
          VALID_USER_REGISTER_INPUTS_2.EMAIL,
          VALID_USER_REGISTER_INPUTS_2.PASSWORD,
          VALID_USER_REGISTER_INPUTS_2.FIRSTNAME,
          VALID_USER_REGISTER_INPUTS_2.LASTNAME
        );
        const VALID_TOKEN2 = register2.jsonBody.token;
        positionObj = {
          newPosition: 1
        };
        expect(adminQuizQuestionMoveV2(VALID_QUIZ_ID, VALID_QUESTION_ID0, positionObj, VALID_TOKEN2)).toStrictEqual(ERROR403);
      });
      test('Token is valid, but quizId and questionId are invalid', () => {
        positionObj = {
          newPosition: 1
        };
        expect(adminQuizQuestionMoveV2(INVALID_QUIZ_ID, INVALID_QUESTION_ID, positionObj, VALID_TOKEN)).toStrictEqual(ERROR403);
      });
      test('Token is valid, but quizId, questionId and position are invalid', () => {
        positionObj = {
          newPosition: 5
        };
        expect(adminQuizQuestionMoveV2(INVALID_QUIZ_ID, INVALID_QUESTION_ID, positionObj, VALID_TOKEN)).toStrictEqual(ERROR403);
      });
    });
    describe('ERROR-400 (Token and quizId are valid)', () => {
      test('Question Id does not refer to a valid question within this quiz', () => {
        positionObj = {
          newPosition: 1
        };
        expect(adminQuizQuestionMoveV2(VALID_QUIZ_ID, INVALID_QUESTION_ID, positionObj, VALID_TOKEN)).toStrictEqual(ERROR400);
      });
      test('NewPosition is less than 0, or NewPosition is greater than n-1 where n is the number of questions', () => {
        positionObj = {
          newPosition: -1
        };
        expect(adminQuizQuestionMoveV2(VALID_QUIZ_ID, VALID_QUESTION_ID0, positionObj, VALID_TOKEN)).toStrictEqual(ERROR400);
      });
      test('NewPosition is the position of the current question', () => {
        positionObj = {
          newPosition: 0
        };
        expect(adminQuizQuestionMoveV2(VALID_QUIZ_ID, VALID_QUESTION_ID0, positionObj, VALID_TOKEN)).toStrictEqual(ERROR400);
      });
    });
  });

  describe('successful test', () => {
    beforeEach(() => {
      const register = adminAuthRegister(
        VALID_USER_REGISTER_INPUTS_1.EMAIL,
        VALID_USER_REGISTER_INPUTS_1.PASSWORD,
        VALID_USER_REGISTER_INPUTS_1.FIRSTNAME,
        VALID_USER_REGISTER_INPUTS_1.LASTNAME
      );
      VALID_TOKEN = register.jsonBody.token;
      const newQuiz = adminQuizCreate(
        VALID_TOKEN,
        VALID_QUIZ_CREATE_INPUTS_1.NAME,
        VALID_QUIZ_CREATE_INPUTS_1.DESCRIPTION
      );
      VALID_QUIZ_ID = newQuiz.jsonBody.quizId;
      const Question = adminCreateQuizQuestion(
        VALID_QUIZ_ID,
        VALID_TOKEN,
        validQuestion1
      );
      VALID_QUESTION_ID0 = Question.jsonBody.questionId;
      const Question2 = adminCreateQuizQuestion(
        VALID_QUIZ_ID,
        VALID_TOKEN,
        validQuestion3
      );
      VALID_QUESTION_ID1 = Question2.jsonBody.questionId;
      positionObj = {
        newPosition: 1
      };
    });
    test('return value successful', () => {
      expect(adminQuizQuestionMoveV2(
        VALID_QUIZ_ID,
        VALID_QUESTION_ID0,
        positionObj,
        VALID_TOKEN)
      ).toStrictEqual(QUIZ_QUESTION_MOVED_SUCCESSFUL);
    });
    test('move question successful', () => {
      let questions:QuestionBody[] = adminQuizInfo(VALID_TOKEN, VALID_QUIZ_ID).jsonBody.questions;
      let index = questions.findIndex(question => question.questionId === VALID_QUESTION_ID0);
      expect(index).toStrictEqual(0);
      adminQuizQuestionMoveV2(VALID_QUIZ_ID, VALID_QUESTION_ID0, positionObj, VALID_TOKEN);
      questions = adminQuizInfo(VALID_TOKEN, VALID_QUIZ_ID).jsonBody.questions;
      index = questions.findIndex(question => question.questionId === VALID_QUESTION_ID0);
      expect(index).toStrictEqual(1);
    });
    test('timeLastEdited is updated', () => {
      const unmodifiedTimeLastEdited: number = adminQuizInfo(VALID_TOKEN, VALID_QUIZ_ID).jsonBody.timeLastEdited;
      adminQuizQuestionMoveV2(VALID_QUIZ_ID, VALID_QUESTION_ID0, positionObj, VALID_TOKEN);
      const modifiedTimeLastEdited: number = adminQuizInfo(VALID_TOKEN, VALID_QUIZ_ID).jsonBody.timeLastEdited;
      // time change of timeLastEdited is too small to check
      // the solution from the Ed forum
      expect(modifiedTimeLastEdited).toBeGreaterThanOrEqual(unmodifiedTimeLastEdited);
    });
  });
});
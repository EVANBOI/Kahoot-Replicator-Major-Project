import { ERROR401 } from '../testConstants';
import {
  adminAuthRegister,
  adminQuizCreateV2,
  adminQuizRemove,
  adminQuizTrashViewV2,
  clear
} from '../wrappers';

beforeEach(() => {
  clear();
});

let sessionId: string;
let quizId: number;

beforeEach(() => {
  const { jsonBody: body1 } =
    adminAuthRegister(
      'evan.xiong@unsw.edu.au',
      'abc1234e',
      'Evan',
      'Xiong'
    );
  sessionId = body1?.token;
  const { jsonBody: body2 } = adminQuizCreateV2(
    sessionId, 'Quiz 1', 'Pointers');
  quizId = body2?.quizId;
  adminQuizRemove(sessionId, quizId);
});

describe('Invalid Trash View', () => {
  test('Token is invalid', () => {
    expect(adminQuizTrashViewV2(sessionId + 1)).toStrictEqual(ERROR401);
  });

  test('Token is empty', () => {
    expect(adminQuizTrashViewV2(' ')).toStrictEqual(ERROR401);
  });
});

describe('Valid Trash View', () => {
  test('Viewing a quiz in the trash', () => {
    expect(adminQuizTrashViewV2(sessionId)).toStrictEqual({
      statusCode: 200,
      jsonBody: {
        quizzes: [
          {
            quizId: quizId,
            name: 'Quiz 1'
          }
        ]
      }
    });
  });

  test('Viewing multiple quizzes in the trash', () => {
    const { jsonBody: body3 } = adminQuizCreateV2(
      sessionId, 'Quiz 2', 'Linked Lists');
    const quizId2 = body3?.quizId;
    adminQuizRemove(sessionId, quizId2);
    expect(adminQuizTrashViewV2(sessionId)).toStrictEqual({
      statusCode: 200,
      jsonBody: {
        quizzes: [
          {
            quizId: quizId,
            name: 'Quiz 1'
          }, {
            quizId: quizId2,
            name: 'Quiz 2'
          }
        ]
      }
    });
  });
});

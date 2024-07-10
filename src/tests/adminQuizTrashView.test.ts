import { 
  adminAuthRegister, 
  adminQuizCreate, 
  adminQuizRemove, 
  adminQuizTrashView, 
  clear } from '../wrappers';

const ERROR = {
  statusCode: 401,
  jsonBody: { error: expect.any(String) }
};

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
  const { jsonBody: body2 } = adminQuizCreate(sessionId, 'Quiz 1', 'Pointers');
  quizId = body2?.quizId;
  adminQuizRemove(sessionId, quizId);
});

describe('Invalid Trash View', () => {
  test('Token is invalid', () => {
    expect(adminQuizTrashView(sessionId + 1)).toStrictEqual(ERROR);
  });

  test('Token is empty', () => {
    expect(adminQuizTrashView(' ')).toStrictEqual(ERROR);
  })
})

describe('Valid Trash View', () => {
  test('Viewing a quiz in the trash', () => {
    console.log(adminQuizTrashView(sessionId));
    expect(adminQuizTrashView(sessionId)).toStrictEqual({
      statusCode: 200,
      jsonBody: {
        quizzes: [
          {
            quizId: quizId,
            name: "Quiz 1"
          }
        ]
      }
    })
  })

  test('Viewing multiple quizzes in the trash', () => {
    const { jsonBody: body3 } = adminQuizCreate(sessionId, 'Quiz 2', 'Linked Lists');
    const quizId2 = body3?.quizId;
    adminQuizRemove(sessionId, quizId2);
    expect(adminQuizTrashView(sessionId)).toStrictEqual({
      statusCode: 200,
      jsonBody: {
        quizzes: [
          {
            quizId: quizId,
            name: "Quiz 1"
          }, {
            quizId: quizId2,
            name: "Quiz 2"
          }
        ]
      }
    })
  })
})






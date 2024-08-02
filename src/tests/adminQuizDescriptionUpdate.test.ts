import {
  adminAuthRegister,
  adminQuizDescriptionUpdate,
  clear,
  adminQuizCreate,
  adminQuizInfo,
  adminQuizDescriptionUpdateV2
} from '../wrappers';

beforeEach(() => {
  clear();
});

// v1 route tests
describe('error cases for v1', () => {
  let sessionId1: string;
  let quizId1: number;
  beforeEach(() => {
    const { jsonBody: body1 } = adminAuthRegister(
      'admin1@gmail.com', 'SDFJKH2349081j', 'JJone', 'ZZ'
    );
    sessionId1 = body1?.token;

    const { jsonBody: Quiz1 } = adminQuizCreate(
      sessionId1, 'Quiz 1', 'this is first original description');
    quizId1 = Quiz1?.quizId;
  });

  test('Session id does not exist', () => {
    expect(adminQuizDescriptionUpdate('-999', quizId1, 'changed description'))
      .toStrictEqual({
        statusCode: 401,
        jsonBody: { error: expect.any(String) }
      });
  });
  test('Quiz id does not exist', () => {
    expect(adminQuizDescriptionUpdate(sessionId1, -999, 'changed description'))
      .toStrictEqual({
        statusCode: 403,
        jsonBody: { error: expect.any(String) }
      });
  });

  test('Description length is more than 100 characters', () => {
    expect(adminQuizDescriptionUpdate(sessionId1, quizId1, 'a'.repeat(200)))
      .toStrictEqual({
        statusCode: 400,
        jsonBody: { error: expect.any(String) }
      });
  });
});

describe('success cases for v1', () => {
  test('Check return type', () => {
    const token = adminAuthRegister(
      'admin1@gmail.com', 'SDFJKH2349081j', 'JJone', 'ZZ'
    ).jsonBody.token;
    const quizId1 = adminQuizCreate(
      token, 'Quiz 1', 'this is first original description').jsonBody.quizId;
    const { jsonBody, statusCode } = adminQuizDescriptionUpdate(token, quizId1, 'changed');
    expect(statusCode).toStrictEqual(200);
    expect(jsonBody).toStrictEqual({});
  });
});

// v2 route tests
describe('Error cases for v2', () => {
  describe('No users exists in database', () => {
    test('Invalid sessionId', () => {
      expect(adminQuizDescriptionUpdateV2('-1', 1, 'no data in database')).toStrictEqual({
        statusCode: 401,
        jsonBody: { error: expect.any(String) }
      });
    });
  });
  describe('users and quizzes exist', () => {
    let sessionId1: string, sessionId2: string;
    let quizId1: number;
    beforeEach(() => {
      const { jsonBody: body1 } = adminAuthRegister(
        'admin1@gmail.com', 'SDFJKH2349081j', 'JJone', 'ZZ'
      );
      sessionId1 = body1?.token;

      const { jsonBody: body2 } = adminAuthRegister(
        'admin2@gmail.com', 'SDFJKH2349081j', 'JJone', 'ZZ'
      );
      sessionId2 = body2?.token;

      const { jsonBody: Quiz1 } = adminQuizCreate(
        sessionId1, 'Quiz 1', 'this is first original description');
      quizId1 = Quiz1?.quizId;
    });

    test('Session id does not exist', () => {
      expect(adminQuizDescriptionUpdateV2('-999', quizId1, 'changed description'))
        .toStrictEqual({
          statusCode: 401,
          jsonBody: { error: expect.any(String) }
        });
    });
    test('Quiz id does not exist', () => {
      expect(adminQuizDescriptionUpdateV2(sessionId1, -999, 'changed description'))
        .toStrictEqual({
          statusCode: 403,
          jsonBody: { error: expect.any(String) }
        });
    });
    test('User does not own quiz to be updated', () => {
      expect(adminQuizDescriptionUpdateV2(sessionId2, quizId1, 'changed description'))
        .toStrictEqual({
          statusCode: 403,
          jsonBody: { error: expect.any(String) }
        });
    });
    test('Description length is more than 100 characters', () => {
      expect(adminQuizDescriptionUpdateV2(sessionId1, quizId1, 'a'.repeat(200)))
        .toStrictEqual({
          statusCode: 400,
          jsonBody: { error: expect.any(String) }
        });
    });
  });
});

describe('Successful function run for v2', () => {
  let sessionId1: string, sessionId2: string;
  let quizId1: number, quizId2: number, quizId3: number;
  beforeEach(() => {
    const { jsonBody: body1 } = adminAuthRegister(
      'admin1@gmail.com', 'SDFJKH2349081j', 'JJone', 'ZZ'
    );
    sessionId1 = body1?.token;
    const { jsonBody: body2 } = adminAuthRegister(
      'admin2@gmail.com', 'SDFJKH2349081j', 'JJone', 'ZZ'
    );
    sessionId2 = body2?.token;

    const { jsonBody: quiz1 } = adminQuizCreate(
      sessionId1, 'Quiz 1', 'this is first original description');
    quizId1 = quiz1?.quizId;

    const { jsonBody: quiz2 } = adminQuizCreate(
      sessionId1, 'Quiz 2', 'this is second original description');
    quizId2 = quiz2?.quizId;

    const { jsonBody: quiz3 } = adminQuizCreate(
      sessionId2, 'Quiz 3', 'this is thrid original description');
    quizId3 = quiz3?.quizId;
  });

  describe('Update description once', () => {
    test('Check return type', () => {
      const { jsonBody, statusCode } = adminQuizDescriptionUpdateV2(sessionId1, quizId1, 'changed');
      expect(statusCode).toStrictEqual(200);
      expect(jsonBody).toStrictEqual({});
    });

    test('Quiz is updated once correctly', () => {
      adminQuizDescriptionUpdateV2(sessionId1, quizId1, 'changed');
      const quizInfo = adminQuizInfo(sessionId1, quizId1);
      expect(quizInfo).toStrictEqual({
        statusCode: 200,
        jsonBody: {
          quizId: quizId1,
          name: 'Quiz 1',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'changed',
          numQuestions: expect.any(Number),
          questions: [],
          duration: expect.any(Number)
        }
      });
    });

    test('Time last edited is updated correctly', () => {
      adminQuizDescriptionUpdateV2(sessionId1, quizId1, 'changed');
      const { jsonBody: quizInfo } = adminQuizInfo(sessionId1, quizId1);
      expect(quizInfo?.timeCreated).toBeLessThanOrEqual((quizInfo?.timeLastEdited));
    });

    test('Description update can be an empty string', () => {
      adminQuizDescriptionUpdateV2(sessionId1, quizId1, '');
      const quizInfo = adminQuizInfo(sessionId1, quizId1);
      expect(quizInfo).toStrictEqual({
        statusCode: 200,
        jsonBody: {
          quizId: quizId1,
          name: 'Quiz 1',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: '',
          numQuestions: expect.any(Number),
          questions: [],
          duration: expect.any(Number)
        }
      });
    });
  });

  describe('Update description multiple times', () => {
    test('User updates same quiz multiple times', () => {
      adminQuizDescriptionUpdateV2(sessionId1, quizId1, 'changed');
      adminQuizDescriptionUpdateV2(sessionId1, quizId1, 'changed twice');
      expect(adminQuizInfo(sessionId1, quizId1)).toStrictEqual({
        statusCode: 200,
        jsonBody: {
          quizId: quizId1,
          name: 'Quiz 1',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'changed twice',
          numQuestions: expect.any(Number),
          questions: [],
          duration: expect.any(Number)
        }
      });
    });

    test('User updates multiple different quizzes', () => {
      adminQuizDescriptionUpdateV2(sessionId1, quizId1, 'changed quiz 1');
      adminQuizDescriptionUpdateV2(sessionId1, quizId2, 'changed quiz 2');
      expect(adminQuizInfo(sessionId1, quizId2)).toStrictEqual({
        statusCode: 200,
        jsonBody: {
          quizId: quizId2,
          name: 'Quiz 2',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'changed quiz 2',
          numQuestions: expect.any(Number),
          questions: [],
          duration: expect.any(Number)
        }
      });
    });

    test('Different users updates different quizzes', () => {
      adminQuizDescriptionUpdateV2(sessionId1, quizId1, 'changed quiz 1');
      adminQuizDescriptionUpdateV2(sessionId2, quizId3, 'changed quiz 3');
      expect(adminQuizInfo(sessionId2, quizId3)).toStrictEqual({
        statusCode: 200,
        jsonBody: {
          quizId: quizId3,
          name: 'Quiz 3',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'changed quiz 3',
          numQuestions: expect.any(Number),
          questions: [],
          duration: expect.any(Number)
        }
      });
    });
  });
});

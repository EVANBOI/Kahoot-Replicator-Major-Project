import { clear } from '../other';
import { adminAuthRegister, adminQuizDescriptionUpdate } from '../wrappers';
import {
  adminQuizCreate,
  adminQuizInfo
} from '../quiz';
import { ok } from '../helpers';
import { notDeepEqual } from 'assert';
const ERROR = { 
  statusCode: 401,
  jsonBody: { error: expect.any(String) }
};

beforeEach(() => {
  clear();
});

describe('Error cases', () => {
  describe('No users exists in database', () => {
    test.failing('Invalid sessionId', () => {
      expect(adminQuizDescriptionUpdate('-1', 1, 'no data in database')).toStrictEqual(ERROR);
    });
  });
  describe('users and quizzes exist', () => {
    let sessionId1: string, sessionId2: string;
    let quizId1: number;
    beforeEach(() => {
      const { jsonBody: Body1 } = adminAuthRegister(
        'admin1@gmail.com', 'SDFJKH2349081j', 'JJone', 'ZZ'
      );
      sessionId1 = Body1?.sessionId;

      const { jsonBody: Body2 } = adminAuthRegister(
        'admin2@gmail.com', 'SDFJKH2349081j', 'JJone', 'ZZ'
      );
      sessionId2 = Body2?.sessionId;

      quizId1 = ok(adminQuizCreate(
        sessionId1, 'Quiz 1', 'this is first original description')
      ).quizId;
    });

    test.failing('Session id does not exist', () => {
      expect(adminQuizDescriptionUpdate('-999', quizId1, 'changed description')).toStrictEqual(ERROR);
    });
    test.failing('Quiz id does not exist', () => {
      expect(adminQuizDescriptionUpdate(sessionId1, -999, 'changed description')).toStrictEqual(ERROR);
    });
    test.failing('User does not own quiz to be updated', () => {
      expect(adminQuizDescriptionUpdate(sessionId2, quizId1, 'changed description')).toStrictEqual(ERROR);
    });
  });
});

describe('Successful function run', () => {
  let sessionId1: string, sessionId2: string;
  let quizId1: number, quizId2: number, quizId3: number;
  beforeEach(() => {
    const { jsonBody: Body1 } = adminAuthRegister(
      'admin1@gmail.com', 'SDFJKH2349081j', 'JJone', 'ZZ'
    );
      sessionId1 = Body1?.sessionId;

    const { jsonBody: Body2 } = adminAuthRegister(
      'admin2@gmail.com', 'SDFJKH2349081j', 'JJone', 'ZZ'
    );
    sessionId2 = Body2?.sessionId;

    quizId1 = ok(
      adminQuizCreate(sessionId1, 'Quiz 1', 'this is first original description')).quizId;
    quizId2 = ok(
      adminQuizCreate(sessionId1, 'Quiz 2', 'this is second original description')).quizId;
    quizId3 = ok(
      adminQuizCreate(sessionId2, 'Quiz 3', 'this is third original description')).quizId;
  });
  test.failing('Check return type', () => {
    const { jsonBody, statusCode } = adminQuizDescriptionUpdate(sessionId1, quizId1, 'changed')
    expect(statusCode).toStrictEqual(200);
    expect(jsonBody).toStrictEqual({});
  });
  
  test.failing('Quiz is updated once correctly', () => {
    adminQuizDescriptionUpdate(sessionId1, quizId1, 'changed');
    const quizInfo = adminQuizInfo(sessionId1, quizId1)
    expect(quizInfo).toStrictEqual({
      quizId: quizId1,
      name: 'Quiz 1',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'changed'
    });
  });

  test('Time last edited is updated correctly', () => {
    adminQuizDescriptionUpdate(sessionId1, quizId1, 'changed');
    const quizInfo = ok(adminQuizInfo(sessionId1, quizId1));
    expect(quizInfo.timeCreated).toBeLessThanOrEqual((quizInfo.timeLastEdited));
  })

  test.failing('User updates same quiz multiple times', () => {
    adminQuizDescriptionUpdate(sessionId1, quizId1, 'changed');
    adminQuizDescriptionUpdate(sessionId1, quizId1, 'changed twice');
    expect(adminQuizInfo(sessionId1, quizId1)).toStrictEqual({
      quizId: quizId1,
      name: 'Quiz 1',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'changed twice'
    });
  });

  test.failing('User updates multiple different quizzes', () => {
    adminQuizDescriptionUpdate(sessionId1, quizId1, 'changed quiz 1');
    adminQuizDescriptionUpdate(sessionId1, quizId2, 'changed quiz 2');
    expect(adminQuizInfo(sessionId1, quizId2)).toStrictEqual({
      quizId: quizId2,
      name: 'Quiz 2',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'changed quiz 2'
    });
  });

  test.failing('Different users updates different quizzes', () => {
    adminQuizDescriptionUpdate(sessionId1, quizId1, 'changed quiz 1');
    adminQuizDescriptionUpdate(sessionId2, quizId3, 'changed quiz 3');
    expect(adminQuizInfo(sessionId2, quizId3)).toStrictEqual({
      quizId: quizId3,
      name: 'Quiz 3',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'changed quiz 3'
    });
  });
  // maybe add in one more test on if the first created quiz time is different to editing multiple times??
});

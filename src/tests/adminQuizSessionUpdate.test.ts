
import { adminQuizSessionStatus, adminAuthRegister, adminCreateQuizQuestionV2, adminQuizCreateV2, adminQuizSessionStart, adminQuizSessionUpdate, clear } from '../wrappers';
import { ERROR400, ERROR401, ERROR403, validQuestion3V2 } from '../testConstants';
import { SessionAction, SessionStatus } from '../session';
import sleepSync from 'slync';

const UPDATED = {
  statusCode: 200,
  jsonBody: { }
};

beforeEach(() => {
  clear();
});

let token1: string, token2: string;
let quizId1: number;
let questionId1: number;
let sessionId1: number;

beforeEach(() => {
  clear();
  token1 = adminAuthRegister(
    'admin1@gmail.com', 'SDFJKH2349081j', 'JJone', 'ZZ'
  ).jsonBody.token;
  token2 = adminAuthRegister(
    'admin2@gmail.com', 'SDFJKH2349081j', 'JJone', 'ZZ'
  ).jsonBody.token;
  quizId1 = adminQuizCreateV2(token1, 'Quiz 1', '1st description').jsonBody.quizId;
  questionId1 = adminCreateQuizQuestionV2(quizId1, token1, validQuestion3V2).jsonBody.questionId;
});

describe('Unsuccessful Updates: 401 errors', () => {
  beforeEach(() => {
    sessionId1 = adminQuizSessionStart(quizId1, token1, 5).jsonBody.sessionId;
  });
  test('Token is invalid', () => {
    expect(adminQuizSessionUpdate(quizId1, sessionId1, token1 + 1, SessionAction.END)).toStrictEqual(ERROR401);
  });

  test('Token is empty', () => {
    expect(adminQuizSessionUpdate(quizId1, sessionId1, ' ', SessionAction.END)).toStrictEqual(ERROR401);
  });
});

describe('Unsuccessful Updates: 403 errors', () => {
  beforeEach(() => {
    sessionId1 = adminQuizSessionStart(quizId1, token1, 5).jsonBody.sessionId;
  });
  test('Quiz does not exist', () => {
    expect(adminQuizSessionUpdate(quizId1 + 1, sessionId1, token1, SessionAction.END)).toStrictEqual(ERROR403);
  });

  test('User is not an owner of the quiz', () => {
    expect(adminQuizSessionUpdate(quizId1, sessionId1, token2, SessionAction.END)).toStrictEqual(ERROR403);
  });
});

describe('Unsuccessful Updates: 400 errors', () => {
  test('No sessions exist', () => {
    const res = adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    expect(res).toStrictEqual(ERROR400);
  });
});

describe('Unsuccessful Updates: 400 errors', () => {
  beforeEach(() => {
    sessionId1 = adminQuizSessionStart(quizId1, token1, 5).jsonBody.sessionId;
  });
  test('SessionId does not refer to valid session within this quiz', () => {
    const quizId2 = adminQuizCreateV2(token2, 'Quiz 2', '2nd description').jsonBody.quizId;
    const sessionId2 = adminQuizSessionStart(quizId2, token2, 5).jsonBody.sessionId;
    const res = adminQuizSessionUpdate(quizId1, sessionId2, token1, SessionAction.END);
    expect(res).toStrictEqual(ERROR400);
  });

  test('Action provided is not a valid Action enum', () => {
    const invalidAction = 'INVALID_ACTION' as unknown as SessionAction;
    expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, invalidAction)).toStrictEqual(ERROR400);
  });

  test('SKIP_COUNTDOWN cannot be applied in the lobby state', () => {
    const res = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state;
    expect(res).toStrictEqual(SessionStatus.LOBBY);
    expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN)).toStrictEqual(ERROR400);
  });

  test('GO_TO_ANSWER cannot be applied in the lobby state', () => {
    const res = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state;
    expect(res).toStrictEqual(SessionStatus.LOBBY);
    expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_ANSWER)).toStrictEqual(ERROR400);
  });

  test('GO_TO_FINAL_RESULTS cannot be applied in the lobby state', () => {
    const res = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state;
    expect(res).toStrictEqual(SessionStatus.LOBBY);
    expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_FINAL_RESULTS)).toStrictEqual(ERROR400);
  });

  test('NEXT_QUESTION cannot be applied in the question countdown state', () => {
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    const res = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state;
    expect(res).toStrictEqual(SessionStatus.QUESTION_COUNTDOWN);
    expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION)).toStrictEqual(ERROR400);
  });

  test('GO_TO_ANSWER cannot be applied in the question countdown state', () => {
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    const res = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state;
    expect(res).toStrictEqual(SessionStatus.QUESTION_COUNTDOWN);
    expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_ANSWER)).toStrictEqual(ERROR400);
  });

  test('GO_TO_FINAL_RESULTS cannot be applied in the question countdown state', () => {
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    const res = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state;
    expect(res).toStrictEqual(SessionStatus.QUESTION_COUNTDOWN);
    expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_FINAL_RESULTS)).toStrictEqual(ERROR400);
  });

  test('NEXT_QUESTION cannot be applied in the question open state', () => {
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
    const res = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state;
    expect(res).toStrictEqual(SessionStatus.QUESTION_OPEN);
    expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION)).toStrictEqual(ERROR400);
  });

  test('GO_TO_FINAL_RESULTS cannot be applied in the question open state', () => {
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
    const res = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state;
    expect(res).toStrictEqual(SessionStatus.QUESTION_OPEN);
    expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_FINAL_RESULTS)).toStrictEqual(ERROR400);
  });

  test('SKIP_QUESTION cannot be applied in the question open state', () => {
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
    const res = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state;
    expect(res).toStrictEqual(SessionStatus.QUESTION_OPEN);
    expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_FINAL_RESULTS)).toStrictEqual(ERROR400);
  });

  test('SKIP_COUNTDOWN cannot be applied in the question close state', () => {
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
    sleepSync(3 * 1000);
    const res = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state;
    expect(res).toStrictEqual(SessionStatus.QUESTION_CLOSE);
    expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN)).toStrictEqual(ERROR400);
  });

  test('GO_TO_ANSWER cannot be applied in the  answer show state', () => {
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_ANSWER);
    const res = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state;
    expect(res).toStrictEqual(SessionStatus.ANSWER_SHOW);
    expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_ANSWER)).toStrictEqual(ERROR400);
  });

  test('SKIP_COUNTDOWN cannot be applied in the answer show state', () => {
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_ANSWER);
    const res = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state;
    expect(res).toStrictEqual(SessionStatus.ANSWER_SHOW);
    expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN)).toStrictEqual(ERROR400);
  });

  test('NEXT_QUESTION cannot be applied in the final results state', () => {
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_ANSWER);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_FINAL_RESULTS);
    const res = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state;
    expect(res).toStrictEqual(SessionStatus.FINAL_RESULTS);
    expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION)).toStrictEqual(ERROR400);
  });

  test('SKIP_COUNTDOWN cannot be applied in the final results state', () => {
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_ANSWER);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_FINAL_RESULTS);
    const res = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state;
    expect(res).toStrictEqual(SessionStatus.FINAL_RESULTS);
    expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN)).toStrictEqual(ERROR400);
  });

  test('GO_TO_ANSWER cannot be applied in the final results state', () => {
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_ANSWER);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_FINAL_RESULTS);
    const res = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state;
    expect(res).toStrictEqual(SessionStatus.FINAL_RESULTS);
    expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_ANSWER)).toStrictEqual(ERROR400);
  });

  test('GO_TO_FINAL_RESULTS cannot be applied in the final results state', () => {
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_ANSWER);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_FINAL_RESULTS);
    const res = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state;
    expect(res).toStrictEqual(SessionStatus.FINAL_RESULTS);
    expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_FINAL_RESULTS)).toStrictEqual(ERROR400);
  });

  test('NEXT_QUESTION cannot be applied in the end state', () => {
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_ANSWER);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_FINAL_RESULTS);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.END);
    const res = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state;
    expect(res).toStrictEqual(SessionStatus.END);
    expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION)).toStrictEqual(ERROR400);
  });

  test('SKIP_COUNTDOWN cannot be applied in the end state', () => {
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_ANSWER);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_FINAL_RESULTS);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.END);
    const res = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state;
    expect(res).toStrictEqual(SessionStatus.END);
    expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN)).toStrictEqual(ERROR400);
  });

  test('GO_TO_ANSWER cannot be applied in the end state', () => {
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_ANSWER);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_FINAL_RESULTS);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.END);
    const res = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state;
    expect(res).toStrictEqual(SessionStatus.END);
    expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_ANSWER)).toStrictEqual(ERROR400);
  });

  test('GO_TO_FINAL_RESULTS cannot be applied in the end state', () => {
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_ANSWER);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_FINAL_RESULTS);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.END);
    const res = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state;
    expect(res).toStrictEqual(SessionStatus.END);
    expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_FINAL_RESULTS)).toStrictEqual(ERROR400);
  });

  test('END cannot be applied in the end state', () => {
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_ANSWER);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_FINAL_RESULTS);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.END);
    const res = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state;
    expect(res).toStrictEqual(SessionStatus.END);
    expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.END)).toStrictEqual(ERROR400);
  });
});

describe('Successful Updates', () => {
  beforeEach(() => {
    sessionId1 = adminQuizSessionStart(quizId1, token1, 5).jsonBody.sessionId;
  });
  test('Return Correct Type', () => {
    const result = adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    expect(result).toStrictEqual(UPDATED);
  });

  test('Successfully update a session', () => {
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    const result = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody;
    expect(result).toStrictEqual({
      state: SessionStatus.QUESTION_COUNTDOWN,
      atQuestion: 0,
      players: [],
      metadata: {
        quizId: quizId1,
        name: 'Quiz 1',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: '1st description',
        numQuestions: 1,
        questions: [{
          questionId: questionId1,
          question: 'Valid question 3?',
          duration: 2,
          points: 2,
          answers: [
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: 'Amb',
              correct: false
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: 'Bsgd',
              correct: true
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: 'Clsj',
              correct: false
            }
          ],
          thumbnailUrl: 'http://google.com/some/image/path.jpg'
        }],
        duration: 2
      }
    });
  });

  test('Successfully update a session twice', () => {
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
    const result = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody;
    expect(result).toStrictEqual({
      state: SessionStatus.QUESTION_OPEN,
      atQuestion: 1,
      players: [],
      metadata: {
        quizId: quizId1,
        name: 'Quiz 1',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: '1st description',
        numQuestions: 1,
        questions: [{
          questionId: questionId1,
          question: 'Valid question 3?',
          duration: 2,
          points: 2,
          answers: [
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: 'Amb',
              correct: false
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: 'Bsgd',
              correct: true
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: 'Clsj',
              correct: false
            }
          ],
          thumbnailUrl: 'http://google.com/some/image/path.jpg'
        }],
        duration: 2
      }
    });
  });
});

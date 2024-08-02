import { SessionAction, SessionStatus } from '../session';
import sleepSync from 'slync';
import { ERROR400, validQuestion1V2, validQuestion2V2 } from '../testConstants';
import { adminAuthRegister, adminCreateQuizQuestionV2, adminQuizCreate, adminQuizSessionStart, adminQuizSessionUpdate, clear, playerJoin, playerStatus } from '../wrappers';
import { getData } from '../dataStore';
import { findQuizWithId } from '../helpers';

let token1: string;
let sessionId1: number;
let quizId1: number;
let playerId1: number;

beforeEach(() => {
  clear();
  token1 = adminAuthRegister(
    'admin1@gmail.com', 'SDFJKH2349081j', 'JJone', 'ZZ'
  ).jsonBody.token;
  quizId1 = adminQuizCreate(token1, 'Quiz 1', '1st description').jsonBody.quizId;
  adminCreateQuizQuestionV2(quizId1, token1, validQuestion1V2);
  sessionId1 = adminQuizSessionStart(quizId1, token1, 5).jsonBody.sessionId;
  playerId1 = playerJoin(sessionId1, 'Yooiuiudsf').jsonBody.playerId;
});

describe('401 Error Case', () => {
  test('Player Id does not exist', () => {
    const result = playerStatus(playerId1 + 1);
    expect(result).toStrictEqual(ERROR400);
  });
});

describe('200 Success Case', () => {
  test('Correctly return the status of a player', () => {
    const database = getData();
    const quiz = findQuizWithId(database, quizId1);
    const questionNum1 = quiz.numQuestions;
    const session = quiz.sessions.find(s => s.sessionId === sessionId1);
    const atQuestion1 = session.atQuestion;
    const result = playerStatus(playerId1);

    expect(result.jsonBody).toStrictEqual({
      state: SessionStatus.LOBBY,
      numQuestions: questionNum1,
      atQuestion: atQuestion1
    });
  });

  test('The status is correctly returned when the quiz has more than one question', () => {
    adminCreateQuizQuestionV2(quizId1, token1, validQuestion2V2);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
    sleepSync(validQuestion1V2.duration * 1000);
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    const database = getData();
    const quiz = findQuizWithId(database, quizId1);
    const questionNum1 = quiz.numQuestions;
    const session = quiz.sessions.find(s => s.sessionId === sessionId1);
    const atQuestion1 = session.atQuestion;
    const result = playerStatus(playerId1);
    expect(result.jsonBody).toStrictEqual({
      state: SessionStatus.QUESTION_COUNTDOWN,
      numQuestions: questionNum1,
      atQuestion: atQuestion1,
    });
  });
});

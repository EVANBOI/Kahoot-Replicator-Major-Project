import { ERROR400, validQuestion1V2 } from '../testConstants';
import { adminAuthRegister, adminCreateQuizQuestionV2, adminQuizCreate, adminQuizSessionStart, clear, playerChatlog, playerJoin, playerSendMessage } from '../wrappers';

beforeEach(() => {
  clear();
});

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

describe('400 Error Case', () => {
  test.failing('Player id does not exist', () => {
    const res = playerChatlog(playerId1 + 1);
    expect(res).toStrictEqual(ERROR400);
  });
});

describe('200 Success Cases', () => {
  test.failing('Return Correct Type', () => {
    playerSendMessage(playerId1, { messageBody: 'message 1' });
    const result = playerChatlog(playerId1);
    expect(result).toStrictEqual({
      messages: [
        {
          messageBody: expect.any(String),
          playerId: playerId1,
          playerName: expect.any(String),
          timeSent: expect.any(Number)
        }
      ]
    });
  });

  test.failing('Succesfully updated the timeSent key', () => {
    const startTime = Math.floor(Date.now() / 1000);
    playerSendMessage(playerId1, { messageBody: 'message 1' });
    const result = playerChatlog(playerId1).jsonBody.timeSent;

    // Checking that the timestamps are within a 1 second range.
    const endTime = Math.floor(Date.now() / 1000);
    expect(result.jsonBody?.timeLastEdited).toBeGreaterThanOrEqual(startTime);
    expect(result.jsonBody?.timeLastEdited).toBeLessThanOrEqual(endTime);
  });
});

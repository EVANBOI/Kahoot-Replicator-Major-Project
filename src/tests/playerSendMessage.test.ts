import { ERROR400, validQuestion1V2 } from '../testConstants';
import {
  clear,
  adminAuthRegister,
  adminQuizCreate,
  adminCreateQuizQuestionV2,
  adminQuizSessionStart,
  playerJoin,
  playerSendMessage,
  playerChatlog,
} from '../wrappers';

const SUCCESS = {};

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

describe('Unsuccessful tests', () => {
  test('Player id does not exist', () => {
    const res = playerSendMessage(playerId1 - 999, { messageBody: 'message1' });
    expect(res).toStrictEqual(ERROR400);
  });

  test('Message body is less than 1 character', () => {
    const res = playerSendMessage(playerId1, { messageBody: '' });
    expect(res).toStrictEqual(ERROR400);
  });

  test('Message body is more than 100 characters', () => {
    const res = playerSendMessage(playerId1, { messageBody: 'a'.repeat(200) });
    expect(res).toStrictEqual(ERROR400);
  });
});

describe('Successful tests', () => {
  test('Check return type', () => {
    const res = playerSendMessage(playerId1, { messageBody: 'message 1' });
    expect(res.jsonBody).toStrictEqual(SUCCESS);
  });

  test('Check 1 message is sent succesfully', () => {
    playerSendMessage(playerId1, { messageBody: 'message 1' });
    expect(playerChatlog(playerId1).jsonBody).toStrictEqual({
      messages: [
        {
          messageBody: 'message 1',
          playerId: playerId1,
          playerName: 'Yooiuiudsf',
          timeSent: expect.any(Number)
        }
      ]
    });
  });

  test('Check multiple messages are sent succesfully', () => {
    playerSendMessage(playerId1, { messageBody: 'message 1' });
    playerSendMessage(playerId1, { messageBody: 'message 2' });
    expect(playerChatlog(playerId1).jsonBody).toStrictEqual({
      messages: [
        {
          messageBody: 'message 1',
          playerId: playerId1,
          playerName: 'Yooiuiudsf',
          timeSent: expect.any(Number)
        },
        {
          messageBody: 'message 2',
          playerId: playerId1,
          playerName: 'Yooiuiudsf',
          timeSent: expect.any(Number)
        }
      ]
    });
  });
});

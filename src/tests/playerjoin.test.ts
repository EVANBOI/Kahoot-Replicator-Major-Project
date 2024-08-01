import { clear, adminQuizCreate, adminQuizSessionStart, playerJoin, adminAuthRegister, adminCreateQuizQuestionV2 } from '../wrappers';
import { ERROR400, validQuestion1V2 } from '../testConstants';
const SUCCESSFUL = {
  statusCode: 200,
  jsonBody: { playerId: expect.any(Number) }
};
const INVALID_SESSION_ID = 999999; // Example of an invalid session ID
const PLAYER_NAME = 'JohnDoe';
let validSessionId: number;
let token1: string;
beforeEach(() => {
  clear();
  token1 = adminAuthRegister(
    'admin1@gmail.com', 'SDFJKH2349081j', 'JJone', 'ZZ'
  ).jsonBody.token;
  const quizCreateResponse = adminQuizCreate(token1, 'Quiz Title', 'Description');
  const quizId = quizCreateResponse.jsonBody?.quizId;
  adminCreateQuizQuestionV2(quizId, token1, validQuestion1V2);
  const sessionStartResponse = adminQuizSessionStart(quizId, token1, 3);
  validSessionId = sessionStartResponse.jsonBody?.sessionId;
});

describe('POST /v1/player/join, successful cases', () => {
  test('Successful join with valid data', () => {
    const response = playerJoin(validSessionId, PLAYER_NAME);
    expect(response).toStrictEqual(SUCCESSFUL);
  });

  test('Successful join with empty name', () => {
    const response = playerJoin(validSessionId, '');
    expect(response).toStrictEqual(SUCCESSFUL);
  });
});

describe('POST /v1/player/join, unsuccessful cases', () => {
  test('Failure to join due to non-unique name', () => {
    // Join the session with the first player
    playerJoin(validSessionId, PLAYER_NAME);
    const response = playerJoin(validSessionId, PLAYER_NAME); // Attempt to join with the same name
    expect(response).toStrictEqual(ERROR400);
  });

  test('Failure to join due to invalid session ID', () => {
    const response = playerJoin(INVALID_SESSION_ID, PLAYER_NAME);
    expect(response).toStrictEqual(ERROR400);
  });

  /* test('Failure to join due to session not in LOBBY state', () => {
    // Simulate the session not being in the LOBBY state
    const sessionStatus = adminQuizSessionStatus(VALID_QUIZ_ID, validSessionId, 'token');

    // Changing the state to a non-LOBBY state (e.g., IN_PROGRESS)
    sessionStatus.state = 'IN_PROGRESS';

    // Simulate the state change in the actual backend (if needed)
    // For now, assume the status change is handled externally

    const response = playerJoin(validSessionId, PLAYER_NAME);

    expect(response.statusCode).toBe(400);
    expect(response.jsonBody.error).toBe('Session is not in LOBBY state');
  }); */
});

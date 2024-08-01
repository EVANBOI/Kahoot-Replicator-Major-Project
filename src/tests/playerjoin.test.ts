import { clear, adminQuizCreate, adminQuizSessionStart, playerJoin, adminQuizSessionStatus } from '../wrappers';
import { ErrorMessage } from '../types';

const VALID_QUIZ_ID = 1; // Example quiz ID
const INVALID_SESSION_ID = 999999; // Example of an invalid session ID
const PLAYER_NAME = 'JohnDoe';

describe('POST /v1/player/join', () => {
  let validSessionId: number;

  beforeEach(() => {
    clear();

    const quizCreateResponse = adminQuizCreate('token', 'Quiz Title', 'Description');
    console.log('Quiz Create Response:', quizCreateResponse);
    
    const quizId = quizCreateResponse.jsonBody?.quizId;
    if (!quizId) {
      throw new Error('Quiz creation failed');
    }

    const sessionStartResponse = adminQuizSessionStart(quizId, 'token', 3);
    console.log('Session Start Response:', sessionStartResponse);
    
    validSessionId = sessionStartResponse.jsonBody?.sessionId;
    if (!validSessionId) {
      throw new Error('Session start failed');
    }
  });

  test('Successful join with valid data', () => {
    const response = playerJoin(validSessionId, PLAYER_NAME);

    expect(response.statusCode).toBe(200);
    expect(response.jsonBody).toHaveProperty('playerId');
  });

  test('Successful join with empty name', () => {
    const response = playerJoin(validSessionId, '');

    expect(response.statusCode).toBe(200);
    expect(response.jsonBody).toHaveProperty('playerId');

    // Check the format of the generated name
    const generatedName = response.jsonBody.name;
    expect(generatedName).toMatch(/^[a-z]{5}\d{3}$/); // Format [5 letters][3 numbers]
  });

  test('Failure to join due to non-unique name', () => {
    // Join the session with the first player
    playerJoin(validSessionId, PLAYER_NAME);

    const response = playerJoin(validSessionId, PLAYER_NAME); // Attempt to join with the same name

    expect(response.statusCode).toBe(400);
    expect(response.jsonBody.error).toBe('Name of user entered is not unique.');
  });

  test('Failure to join due to invalid session ID', () => {
    const response = playerJoin(INVALID_SESSION_ID, PLAYER_NAME);

    expect(response.statusCode).toBe(400);
    expect(response.jsonBody.error).toBe('Session Id does not refer to a valid session.');
  });

  /*test('Failure to join due to session not in LOBBY state', () => {
    // Simulate the session not being in the LOBBY state
    const sessionStatus = adminQuizSessionStatus(VALID_QUIZ_ID, validSessionId, 'token');

    // Changing the state to a non-LOBBY state (e.g., IN_PROGRESS)
    sessionStatus.state = 'IN_PROGRESS';
    
    // Simulate the state change in the actual backend (if needed)
    // For now, assume the status change is handled externally

    const response = playerJoin(validSessionId, PLAYER_NAME);

    expect(response.statusCode).toBe(400);
    expect(response.jsonBody.error).toBe('Session is not in LOBBY state');
  });*/
});

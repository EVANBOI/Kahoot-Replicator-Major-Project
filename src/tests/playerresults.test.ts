import {
    ERROR400,
    ERROR401,
    ERROR403,
    SUCCESSFUL_UPDATE,
    validQuestion1V2
  } from '../testConstants';
  import {
    clear,
    adminAuthRegister,
    adminQuizCreate,
    adminCreateQuizQuestionV2,
    adminQuizSessionStart,
    playerJoin,
    playerResults
  } from '../wrappers';
  
  const SUCCESS = {
    statusCode: 200,
    jsonBody: {
      usersRankedByScore: [
        {
          name: 'Hayden',
          score: expect.any(Number)
        }
      ],
      questionResults: [
        {
          questionId: expect.any(Number),
          playersCorrectList: ['Hayden'],
          averageAnswerTime: expect.any(Number),
          percentCorrect: expect.any(Number)
        }
      ]
    }
  };
  
  let token1: string;
  let quizId1: number;
  let sessionId1: number;
  let playerId1: number;
  
  beforeEach(() => {
    clear();
    token1 = adminAuthRegister(
      'admin1@gmail.com', 'SDFJKH2349081j', 'JJone', 'ZZ'
    ).jsonBody.token;
    quizId1 = adminQuizCreate(token1, 'Quiz 1', '1st description').jsonBody.quizId;
    adminCreateQuizQuestionV2(quizId1, token1, validQuestion1V2);
    
    const sessionResponse = adminQuizSessionStart(quizId1, token1, 3);
    sessionId1 = sessionResponse.jsonBody.sessionId;
    
    const playerJoinResponse = playerJoin(sessionId1, 'Hayden');
    playerId1 = playerJoinResponse.jsonBody.playerId;
  });
  
  describe('Unsuccessful tests', () => {
    test('Invalid player ID', () => {
      const invalidPlayerId = 999999; // An example of an invalid player ID
      const res = playerResults(invalidPlayerId);
      expect(res).toStrictEqual(ERROR400);
    });
  
    test('Session is not in FINAL_RESULTS state', () => {
      // Simulate the session not being in the FINAL_RESULTS state
      const res = playerResults(playerId1);
      expect(res).toStrictEqual(ERROR400);
    });
  
    test('Player ID does not exist', () => {
      // Assuming a method to start session and get results before player ID is valid
      const anotherPlayerId = 888888; // Example of a non-existent player ID
      const res = playerResults(anotherPlayerId);
      expect(res).toStrictEqual(ERROR400);
    });
  });
  
  describe('Successful tests', () => {
    test('Successful retrieval of player results', () => {
      // Simulate the session being in FINAL_RESULTS state
      // This could be done by making sure the session state is FINAL_RESULTS in the backend
  
      const res = playerResults(playerId1);
      expect(res).toStrictEqual(SUCCESS);
    });
  
    test('Check if player results include correct details', () => {
      // Simulate the session being in FINAL_RESULTS state
      const res = playerResults(playerId1);
  
      // Ensure the results include correct details
      expect(res.statusCode).toBe(200);
      expect(res.jsonBody).toHaveProperty('usersRankedByScore');
      expect(res.jsonBody).toHaveProperty('questionResults');
  
      // Validate the structure of usersRankedByScore
      expect(res.jsonBody.usersRankedByScore).toEqual(
        expect.arrayContaining([
          {
            name: 'Hayden',
            score: expect.any(Number)
          }
        ])
      );
  
      // Validate the structure of questionResults
      expect(res.jsonBody.questionResults).toEqual(
        expect.arrayContaining([
          {
            questionId: expect.any(Number),
            playersCorrectList: ['Hayden'],
            averageAnswerTime: expect.any(Number),
            percentCorrect: expect.any(Number)
          }
        ])
      );
    });
  });
  
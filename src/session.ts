import { GetSessionStatus, SessionStatus } from "./types";
/**
 * Gives the status of a particular quiz session
 * @param {number} quizId The ID of the quiz to be found.
 * @param {number} sessionId The ID of the session to be found.
 * @returns {} An empty object
 * @returns {ErrorMessage} An error message
 */

export function adminQuizSessionStatus (quizId: number, sessionId: number): GetSessionStatus {
  return {
    state: SessionStatus.LOBBY,
    atQuestion: 1,
    players: [
      'Hayden'
    ],
    metadata: {
      quizId: 5546,
      name: 'This is name of the quiz',
      timeCreated: 102985709,
      timeLastEdited: 102985709,
      description: 'this is dsghsjkdfhjkh',
      numQuestions: 1,
      questions: [
        {
          questionId: 5565,
          question: 'Thishfdoixhsddof',
          duration: 44,
          thumbnailUrl: 'http://google.com/some/image/path.jpg',
          points: 5,
          answers: [
            {
              answerId: 2384,
              answer: 'Prince Charles',
              colour: 'red',
              correct: true
            }
          ]
        }
      ],
      duration: 44,
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    }
  };
}

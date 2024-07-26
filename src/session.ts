import { EmptyObject, GetSessionStatus, SessionStatus, V2QuestionBody } from "./types";

/**
 * Gives the status of a particular quiz session
 * @param {number} quizId The ID of the quiz to be found.
 * @param {number} sessionId The ID of the session to be found.
 * @returns {GetSessionStatus} Information about the current quiz session
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

/**
 * Get the information about a question that the guest player is on.
 * @param {number} playerId The ID of the player playing.
 * @param {number} questionPosition The position of the question
 * @returns {V2QuestionBody} Information about the current question
 * @returns {ErrorMessage} An error message
 */
export function playerQuestionInfo (playerId: number, questionPosition: number): V2QuestionBody {
  return {
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
}

/**
 * Send a chat message
 * @param {number} playerId The ID of the player playing.
 * @param {string} message The position of the question
 * @returns {EmptyObject} Returns an empty object
 * @returns {ErrorMessage} An error message
 */
export function playerSendMessage (playerId: number, message: string): EmptyObject | Error {
  // Check if message should be an message object with messageBody or just message body

  return {}
}
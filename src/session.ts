import { 
  EmptyObject, GetSessionStatus, MessageObject, QuizSessionViewResult, 
  QuizSessionResultLinkResult, PlayerQuestionResultResult,
  QuestionBody,PlayerQuestionAnswerResult
} from "./types";

export enum SessionStatus {
  LOBBY, 
  QUESTION_COUNTDOWN, 
  QUESTION_OPEN, 
  QUESTION_CLOSE, 
  ANSWER_SHOW, 
  FINAL_RESULTS, 
  END
}

/**
 * Retrieves active and inactive session ids (sorted in ascending order) for a quiz
 * @param {string} token - unique session id of a user
 * @param {number} quizId The ID of the quiz to be found.
 * @returns {QuizSessionViewResult} active and inactive Sessions
 */
export function adminQuizSessionView (token: string, quizId: number): QuizSessionViewResult {
  return {
    activeSessions: [1, 2],
    inactiveSessions: [3, 4]
  };
}

/**
 * Get the a link to the final results (in CSV format) for all players for a completed quiz session
 * @param {number} quizId The ID of the quiz to be found.
 * @param {number} sessionId The ID of the session to be found.
 * @param {string} token - unique session id of a user
 * @returns {QuizSessionResultResult} active and inactive Sessions
 */
export function adminQuizSessionResultLink (quizId: number, sessionId: number, token: string): QuizSessionResultLinkResult {
  return {
    url: 'http://google.com/some/image/path.csv'
  };
}

/**
 * Get the results for a particular question of the session a player is playing in. Question position starts at 1
 * @param {number} playerId The ID of the player.
 * @param {number} questionposition The position of the question in this quiz.
 * @returns {PlayerQuestionResultResult} active and inactive Sessions
 */
export function PlayerQuestionResult (playerId: number, questionposition: number): PlayerQuestionResultResult {
  return {
    questionId: 1,
    playersCorrectList: [
      'Hayden'
    ],
    averageAnswerTime: 44,
    percentCorrect: 100
  };
}

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
export function playerQuestionInfo (playerId: number, questionPosition: number): QuestionBody {
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
export function playerSendMessage (playerId: number, message: MessageObject): EmptyObject | Error {
  // Check if message should be an message object with messageBody or just message body

  return {}
}

/**
 * Allows the current player to submit answer(s) to the currently active question.
 * @param {number} playerId The ID of the player.
 * @param {number} questionPosition The position of the question.
 * @param {number[]} answerIds The IDs of the submitted answers.
 * @returns {PlayerQuestionAnswerResult} The result of the submission.
 */
export function playerQuestionAnswer(playerId: number, questionPosition: number, answerIds: number[]): PlayerQuestionAnswerResult {
  return {};
}

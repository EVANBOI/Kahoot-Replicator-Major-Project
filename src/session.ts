import { getData } from './dataStore';
import { BadRequest } from './error';
import { findQuizWithId } from './helpers';
import {
  EmptyObject, GetSessionStatus, MessageObject, QuizSessionViewResult,
  QuizSessionResultLinkResult, PlayerQuestionResultResult,
  QuestionBody,
  PlayerStatusResult,
  PlayerChatlogResult,
  PlayerQuestionAnswerResult,
  SessionResults,
  Quiz,
  Session
} from './types';

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
 * @param {number} quizId The ID of the quiz to be found.
 * @returns {QuizSessionViewResult} active and inactive Sessions
 */
export function adminQuizSessionView (quizId: number): QuizSessionViewResult {
  const database = getData();
  const quiz = findQuizWithId(database, quizId);
  const result: QuizSessionViewResult = {
    activeSessions: [],
    inactiveSessions: []
  };
  if (quiz.sessions) {
    quiz.sessions.forEach(session => {
      if (session.state === SessionStatus.END) {
        result.inactiveSessions.push(session.sessionId);
      } else {
        result.activeSessions.push(session.sessionId);
      }
    });
  }
  return result;
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
export function playerQuestionResult (playerId: number, questionposition: number): PlayerQuestionResultResult {
  const database = getData();
  let currentQuiz: Quiz | undefined;
  let currentSession: Session | undefined;

  for (const quiz of database.quizzes) {
    currentSession = quiz.sessions?.find(session =>
      session.players.find(player => player.playerId === playerId)
    );
    if (currentSession) {
      currentQuiz = quiz;
      break; // Exit the loop once the player and thus the session has been found
    }
  }

  if (!currentSession) {
    throw new BadRequest(`Player ${playerId} does not exist`);
  }
  if (questionposition > currentQuiz.numQuestions || questionposition < 1) {
    throw new BadRequest(`Question position ${questionposition} is not valid`);
  }
  if (currentSession.state !== SessionStatus.ANSWER_SHOW) {
    throw new BadRequest('Session is not in ANSWER_SHOW state');
  }
  if (currentSession.atQuestion !== questionposition) {
    throw new BadRequest(`Session is not currently on question ${questionposition}`);
  }

  const questionResult = currentSession.results.questionResults[questionposition - 1];
  return questionResult;
}

/**
 * Update the state of a particular quiz session by sending an action command
 * @param {number} quizId The ID of the quiz to be found.
 * @param {number} sessionId The ID of the session to be found.
 * @param {string} token - unique session id of a user
 * @param {string} action - action command
 * @returns {} active and inactive Sessions
 * @returns {ErrorMessage} An error message
 */

export function adminQuizSessionUpdate(
  quizId: number,
  sessionId: number,
  token: string,
  action: string): EmptyObject | Error {
  return {};
}

/**
 * Gives the status of a particular quiz session
 * @param {number} quizId The ID of the quiz to be found.
 * @param {number} sessionId The ID of the session to be found.
 * @returns {GetSessionStatus} Information about the current quiz session
 * @returns {ErrorMessage} An error message
 */
export function adminQuizSessionStatus (quizId: number, sessionId: number): GetSessionStatus {
  const database = getData();
  const quiz = database.quizzes.find(q => q.quizId === quizId);
  const sessionValid = quiz.sessions.find(s => s.sessionId === sessionId);
  if (!sessionValid) {
    throw new BadRequest(`Session id ${sessionId} does not refer to valid session within quiz`);
  }
  return {
    state: sessionValid.state,
    atQuestion: sessionValid.atQuestion,
    players: sessionValid.players,
    metadata: {
      quizId: quiz.quizId,
      name: quiz.name,
      timeCreated: quiz.timeCreated,
      timeLastEdited: quiz.timeLastEdited,
      description: quiz.description,
      numQuestions: quiz.numQuestions,
      questions: quiz.questions,
      duration: quiz.duration,
      thumbnailUrl: quiz.thumbnailUrl
    }
  };
}

/**
 * Get the status of a guest player that has already joined a session.
 * @param {number} playerId The ID of the player playing.
 * @returns {PlayerStatusResult} Information about the player's status
 * @returns {ErrorMessage} An error message
 */

export function playerStatus(playerId: number): PlayerStatusResult | Error {
  return {
    state: 'LOBBY',
    numQuestions: 1,
    atQuestion: 1
  };
}

/**
 * Get the information about a question that the guest player is on.
 * @param {number} playerId The ID of the player playing.
 * @param {number} questionPosition The position of the question
 * @returns {QuestionBody} Information about the current question
 * @returns {ErrorMessage} An error message
 */
export function playerQuestionInfo (playerId: number, questionPosition: number): QuestionBody {
  const database = getData();
  let currentQuiz: Quiz | undefined;
  let currentSession: Session | undefined;
  for (const quiz of database.quizzes) {
    currentSession = quiz.sessions?.find(session =>
      session.players.find(player => player.playerId === playerId)
    );
    if (currentSession) {
      currentQuiz = quiz;
      break; // Exit the loop once the player and thus the session has been found
    }
  }
  if (!currentSession) {
    throw new BadRequest(`Player ${playerId} does not exist`);
  }
  if (currentQuiz.numQuestions < questionPosition) {
    throw new BadRequest(`Question position ${questionPosition} is not valid`);
  } else if (currentSession.atQuestion !== questionPosition) {
    throw new BadRequest(`Session is not currently on question ${questionPosition}`);
  } else if (currentSession.state === SessionStatus.LOBBY ||
             currentSession.state === SessionStatus.QUESTION_COUNTDOWN ||
             currentSession.state === SessionStatus.FINAL_RESULTS ||
             currentSession.state === SessionStatus.END) {
    throw new BadRequest(`Session is in state ${currentSession.state}`);
  }

  const question = currentQuiz.questions[questionPosition - 1];
  return {
    questionId: question.questionId,
    question: question.question,
    duration: question.duration,
    thumbnailUrl: question.thumbnailUrl,
    points: question.points,
    answers: question.answers
  };
}

/**
 * Return all messages that are in the same session as the player, in the order they were sent
 * @param {number} playerId The ID of the player playing.
 * @returns {PlayerChatlogResult} All the player's messages
 * @returns {ErrorMessage} An error message
 */
export function playerChatlog(playerId: number): PlayerChatlogResult | Error {
  return {
    messages: [
      {
        messageBody: 'This is a message body',
        playerId: 5546,
        playerName: 'Yuchao Jiang',
        timeSent: 1683019484
      }
    ]
  };
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
  const database = getData();
  const player = database.quizzes
    .flatMap(q => q.sessions || [])
    .flatMap(s => s.players || [])
    .find(p => p.playerId === playerId);
  if (!player) {
    throw new BadRequest(`Player ${playerId} does not exist`);
  } else if (message.messageBody.length < 1) {
    throw new BadRequest('Message is less than one character');
  } else if (message.messageBody.length > 100) {
    throw new BadRequest('Message is more than one hundred characters');
  }

  const timeSet = Math.floor(Date.now() / 1000);
  const messageInfo = {
    messageBody: message.messageBody,
    playerId: playerId,
    playerName: player.name,
    timeSet: timeSet
  };

  let currentSession: Session | undefined;
  for (const quiz of database.quizzes) {
    currentSession = quiz.sessions?.find(session =>
      session.players.find(player => player.playerId === playerId)
    );

    if (currentSession) {
      break; // Exit the loop once the player and thus the session has been found
    }
  }
  currentSession.messages.push(messageInfo);
  return {};
}

/**
 * Allows the current player to submit answer(s) to the currently active question.
 * @param {number} playerId The ID of the player.
 * @param {number} questionPosition The position of the question.
 * @param {number[]} answerIds The IDs of the submitted answers.
 * @returns {PlayerQuestionAnswerResult} The result of the submission.
 */
export function playerQuestionAnswer(
  playerId: number,
  questionPosition: number,
  answerIds: number[]
): PlayerQuestionAnswerResult {
  return {};
}

/**
 * Get the final results for all players for a completed quiz session.
 * @param {number} quizId - The ID of the quiz.
 * @param {number} sessionId - The ID of the session.
 * @param {string} token - The token of the user.
 * @returns {SessionResults} - The final results of the session.
 * @returns {ErrorMessage} - An error message.
 */
export function adminQuizSessionResults(
  quizId: number,
  sessionId: number,
  token: string
): SessionResults {
  return {
    usersRankedByScore: [
      {
        name: 'Hayden',
        score: 45,
      },
    ],
    questionResults: [
      {
        questionId: 5546,
        playersCorrectList: ['Hayden'],
        averageAnswerTime: 45,
        percentCorrect: 54,
      },
    ],
  };
}

/**
 * Update the thumbnail for the quiz
 * @param {number} quizId The ID of the quiz
 * @param {string} token The session token of the user
 * @param {string} imgUrl The URL of the new thumbnail image
 * @returns {EmptyObject} Returns an empty object on success
 * @throws {Error} Throws an error if there is a problem with the update
 */
export function adminQuizThumbnailUpdate(quizId: number, token: string, imgUrl: string): EmptyObject {
  return {};
}

export function adminQuizSessionStart(
  quizId: number,
  token: string,
  autoStartNum: number
): { sessionId: number } {
  return { sessionId: 5546 };
}

export function playerJoin(
  sessionId: number,
  name: string
): { playerId: number } {
  return { playerId: 5546 };
}

export function playerResults(
  playerId: number
): SessionResults {
  return {
    usersRankedByScore: [
      { name: 'Hayden', score: 45 }
    ],
    questionResults: [
      {
        questionId: 5546,
        playersCorrectList: ['Hayden'],
        averageAnswerTime: 45,
        percentCorrect: 54
      }
    ]
  };
}

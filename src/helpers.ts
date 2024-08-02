import { getData } from './dataStore';
import { Forbidden, BadRequest, Unauthorised } from './error';
import { Data, ErrorMessage, QuestionBody, User, SessionResults, Session } from './types';
import crypto from 'crypto';

export function getHashOf(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function findUserWithId(authUserId: number) {
  return getData().users.find(user => user.userId === authUserId);
}

export function findQuizWithId(database: Data, quizId: number) {
  return database.quizzes.find(quiz => quiz.quizId === quizId);
}

export function quizIdCheck(token: string, quizId: number) {
  const isValidQuizId = getData().quizzes.find(q => q.quizId === quizId);
  const user = getData().users.find(user => user.tokens.some(tokens => tokens.token === token));
  if (!isValidQuizId) {
    throw new Forbidden('Quiz Id does not exist');
  } else if (user.userId !== isValidQuizId.creatorId) {
    throw new Forbidden('Quiz does not belong to user');
  }
}

export function tokenCheck(token: string) {
  const isValidToken = getData().users.some(user => user.tokens.some(tokens => tokens.token === token));
  if (!isValidToken) {
    throw new Unauthorised('Invalid token provided');
  }
}

export function ok<T>(item: T | { statusCode: number, error: string }): T {
  return item as T;
}

export enum Colours {
  red,
  blue,
  green,
  yellow,
  purple,
  brown,
  orange
}

export function getRandomColour(): string {
  const colourKeys = Object.keys(Colours).filter(key => isNaN(Number(key)));
  const randomIndex = Math.floor(Math.random() * colourKeys.length);
  return colourKeys[randomIndex];
}

export function findUserBySessionId(database: Data, sessionIdToFind: string): User | undefined {
  return database.users.find(user =>
    user.tokens.some(tokens => tokens.token === sessionIdToFind)
  );
}

export function findQuestionInQuizId(database: Data, quizId: number, questionId: number): QuestionBody | undefined {
  const quiz = findQuizWithId(database, quizId);
  return quiz?.questions.find(question => question.questionId === questionId);
}

export function findQuestionIndex(database: Data, quizId: number, questionId: number): number {
  const quiz = findQuizWithId(database, quizId);
  return quiz?.questions.findIndex(question => question.questionId === questionId) as number;
}

export function validAnswers(questionBody: QuestionBody): boolean | ErrorMessage {
  const existingAnswer: string[] = [];
  for (const ans of questionBody.answers) {
    if (ans.answer.length < 1) {
      throw new BadRequest('An answer is less than 1 character long');
    } else if (ans.answer.length > 30) {
      throw new BadRequest('An answer is more than 30 character long');
    } else if (existingAnswer.find(current => current === ans.answer)) {
      throw new BadRequest('There are duplicate answers');
    } else {
      existingAnswer.push(ans.answer);
    }
  }
  const correctExists = questionBody.answers.some(ans => ans.correct === true);
  if (!correctExists) {
    throw new BadRequest('There are no correct answers');
  }
  return true;
}

export function validQuestion(
  questionBody: QuestionBody,
  totalDuration: number
): boolean | ErrorMessage {
  if (questionBody.question.length > 50) {
    throw new BadRequest('Question string is greater than 50 characters');
  } else if (questionBody.question.length < 5) {
    throw new BadRequest('Question string is less than 5 characters');
  } else if (questionBody.answers.length < 2) {
    throw new BadRequest('There are less than 2 answers');
  } else if (questionBody.answers.length > 6) {
    throw new BadRequest('There are more than 6 answers');
  } else if (questionBody.duration <= 0) {
    throw new BadRequest('Duration is non positive');
  } else if (totalDuration > 180) {
    throw new BadRequest('Total duration is more than 3 min');
  } else if (questionBody.points < 1) {
    throw new BadRequest('Point is less than 1');
  } else if (questionBody.points > 10) {
    throw new BadRequest('Point is greater than 10');
  } else if (typeof validAnswers(questionBody) === 'object') {
    return validAnswers(questionBody) as ErrorMessage;
  }
  return true;
}

// this function is the helper function of the adminQuizTrashEmpty, to determine if the given quiz array
// is exist in trash or quizzesStore and creator is token owner
export function quizExistWithCorrectCreatorCheck(token: string, quizIds: string) {
  const data = getData();
  const UserId = findUserBySessionId(data, token)?.userId;
  const quizIdArray: number[] = JSON.parse(quizIds);
  for (const quizId of quizIdArray) {
    const isExistInTrash = data.trash.find(quiz => quiz.quizId === quizId);
    const isExistInQuizzesStore = data.quizzes.find(quiz => quiz.quizId === quizId);
    const isValidQuiz = isExistInTrash || isExistInQuizzesStore;

    if (!isValidQuiz) {
      throw new Forbidden('Quiz does not exist');
    }
    const quiz = isExistInTrash || isExistInQuizzesStore;
    if (quiz?.creatorId !== UserId) {
      throw new Forbidden('You are not the creator of the quiz');
    }
  }
}

export function allExistInTrashCheck(quizIds: string) {
  const data = getData();
  const quizIdArray: number[] = JSON.parse(quizIds);
  const result = quizIdArray.every(elementId => data.trash.some(quiz => quiz.quizId === elementId));
  if (result === false) {
    throw new BadRequest('Not all quizzes are in trash');
  }
}

// helper function to check if the quiz exist and the creator is the token owner
export function quizExistCheck(quizId: number, token: string) {
  const user = findUserBySessionId(getData(), token);
  const quiz = findQuizWithId(getData(), quizId);
  if (!quiz) {
    throw new Forbidden('Quiz does not exist');
  } else if (quiz.creatorId !== user.userId) {
    throw new Forbidden('You are not the creator of the quiz');
  }
}

// Function to convert data to CSV format

export function convertSessionResultsToCSV(sessionResults: SessionResults): string {
  if (!sessionResults.questionResultsByPlayer) {
    throw new Error('questionResultsByPlayer is required');
  }

  let csvContent = 'Player';

  // Add question headers
  sessionResults.questionResultsByPlayer[0].questionResults.forEach((question, index) => {
    csvContent += `,question${index + 1}score,question${index + 1}rank`;
  });
  csvContent += '\n';

  // Add player scores and ranks to CSV content
  sessionResults.questionResultsByPlayer.forEach(playerResult => {
    csvContent += playerResult.playerName;

    playerResult.questionResults.forEach(question => {
      csvContent += `,${question.score},${question.rank}`;
    });

    csvContent += '\n';
  });

  return csvContent;
}

export function generateRandomString() {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  let result = '';

  // Generate 5 unique letters
  while (result.length < 5) {
    const randomLetter = letters[Math.floor(Math.random() * letters.length)];
    if (!result.includes(randomLetter)) {
      result += randomLetter;
    }
  }

  // Generate 3 unique numbers
  while (result.length < 8) {
    const randomNumber = numbers[Math.floor(Math.random() * numbers.length)];
    if (!result.includes(randomNumber)) {
      result += randomNumber;
    }
  }

  return result;
}

// this function will initialise detailed result for each player after the
// seession move out of the lobby state
export function playerDetailedResultsInitialisation(session: Session) {
  // initialise the usersRankedByScore and questionResults
  session.results.usersRankedByScore = session.players.map(player => ({
    name: player.name,
    score: 0
  }));

  session.results.questionResults = session.quizCopy.questions.map(question => ({
    questionId: question.questionId,
    playersCorrectList: [],
    averageAnswerTime: 0,
    percentCorrect: 0,
  }));

  // initialise the questionResultsByPlayer
  session.results.questionResultsByPlayer = [];
  session.players.forEach(player =>
    session.results.questionResultsByPlayer.push({
      playerName: player.name,
      playerId: player.playerId,
      questionResults: session.quizCopy.questions.map(question => ({
        questionId: question.questionId,
        score: 0,
        rank: 1,
        timeToAnswer: -1
      }))
    })
  );

  // initialise the questionStartTime
  const length = session.quizCopy.questions.length;
  session.results.questionStartTime = Array.from({ length }, () => 0);
}

// this function will update the usersRankedByScore and questionResults when the question
// closed or state is Answer show
export function updateResults (session: Session) {
  const questionIndex = session.atQuestion - 1;
  let totalAnswerTime = 0;
  let numAnsweredPlayer = 0;
  session.results.questionResultsByPlayer.forEach(player => {
    // update the score of the player and correct list
    if (player.questionResults[questionIndex].score !== 0) {
      session.results.usersRankedByScore.find(user => user.name === player.playerName).score += player.questionResults[questionIndex].score;
      session.results.questionResults[questionIndex].playersCorrectList.push(player.playerName);
    }
    // if the player answered the question, update the total time and player answered
    if (player.questionResults[questionIndex].timeToAnswer !== -1) {
      const actualUsedTime = (player.questionResults[questionIndex].timeToAnswer - session.results.questionStartTime[questionIndex]) / 1000;
      totalAnswerTime += actualUsedTime
      numAnsweredPlayer++;
    }
  });

  // update the average time and percent correct and percentCorrect
  session.results.questionResults[questionIndex].averageAnswerTime = totalAnswerTime / numAnsweredPlayer;
  session.results.questionResults[questionIndex].percentCorrect = session.results.questionResults[questionIndex].playersCorrectList.length / session.players.length * 100;

  // sort the rank of the player
  session.results.usersRankedByScore.sort((a, b) => b.score - a.score);
}

// record the actuall time when the question is open
export function recordOpenTime(session: Session) {
  session.results.questionStartTime[session.atQuestion - 1] = Math.floor(Date.now() / 1000);
}
import { getData } from './dataStore';
import { Forbidden, BadRequest, Unauthorised } from './error';
import { Data, QuestionBody, User, SessionResults, Session } from './types';
import crypto from 'crypto';

export function getHashOf(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex');
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
  return quiz.questions.find(question => question.questionId === questionId);
}

export function findQuestionIndex(database: Data, quizId: number, questionId: number): number {
  const quiz = findQuizWithId(database, quizId);
  return quiz.questions.findIndex(question => question.questionId === questionId) as number;
}

export function validQuestion(
  questionBody: QuestionBody,
  totalDuration: number
): boolean | string {
  if (questionBody.question.length > 50) {
    return 'Question string is greater than 50 characters';
  } else if (questionBody.question.length < 5) {
    return 'Question string is less than 5 characters';
  } else if (questionBody.answers.length < 2) {
    return 'There are less than 2 answers';
  } else if (questionBody.answers.length > 6) {
    return 'There are more than 6 answers';
  } else if (questionBody.duration <= 0) {
    return 'Duration is non positive';
  } else if (totalDuration > 180) {
    return 'Total duration is more than 3 min';
  } else if (questionBody.points < 1) {
    return 'Point is less than 1';
  } else if (questionBody.points > 10) {
    return 'Point is greater than 10';
  }
  const existingAnswer: string[] = [];
  for (const ans of questionBody.answers) {
    if (ans.answer.length < 1) {
      return 'An answer is less than 1 character long';
    } else if (ans.answer.length > 30) {
      return 'An answer is more than 30 character long';
    } else if (existingAnswer.find(current => current === ans.answer)) {
      return 'There are duplicate answers';
    } else {
      existingAnswer.push(ans.answer);
    }
  }
  const correctExists = questionBody.answers.some(ans => ans.correct === true);
  if (!correctExists) {
    return 'There are no correct answers';
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
}

import { getData } from './dataStore';
import { Error400, Error401, Error403 } from './error';
import { Data, ErrorMessage, QuestionBody, User } from './types';

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
    throw new Error403('Quiz Id does not exist');
  } else if (user.userId !== isValidQuizId.creatorId) {
    throw new Error403('Quiz does not belong to user');
  }
}

export function tokenCheck(token: string) {
  const isValidToken = getData().users.some(user => user.tokens.some(tokens => tokens.token === token));
  if (!isValidToken) {
    throw new Error401('Invalid token provided');
  }
}

export function ok<T>(item: T | { statusCode: number, error: string }): T {
  return item as T;
}

export enum Colours {
  red = 'red',
  blue = 'blue',
  green = 'green',
  yellow = 'yellow',
  purple = 'purple',
  brown = 'brown',
  orange = 'orange'
}

export function getRandomColour(): Colours {
  const colours = Object.values(Colours);
  const randomIndex = Math.floor(Math.random() * colours.length);
  return colours[randomIndex];
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
      throw new Error400('An answer is less than 1 character long');
    } else if (ans.answer.length > 30) {
      throw new Error400('An answer is more than 30 character long');
    } else if (existingAnswer.find(current => current === ans.answer)) {
      throw new Error400('There are duplicate answers');
    } else {
      existingAnswer.push(ans.answer);
    }
  }
  const correctExists = questionBody.answers.some(ans => ans.correct === true);
  if (!correctExists) {
    throw new Error400('There are no correct answers');
  }
  return true;
}

export function validQuestion(
  questionBody: QuestionBody,
  totalDuration: number
): boolean | ErrorMessage {
  if (questionBody.question.length > 50) {
    throw new Error400('Question string is greater than 50 characters');
  } else if (questionBody.question.length < 5) {
    throw new Error400('Question string is less than 5 characters');
  } else if (questionBody.answers.length < 2) {
    throw new Error400('There are less than 2 answers');
  } else if (questionBody.answers.length > 6) {
    throw new Error400('There are more than 6 answers');
  } else if (questionBody.duration <= 0) {
    throw new Error400('Duration is negative');
  } else if (totalDuration > 180) {
    throw new Error400('Total duration is more than 3 min');
  } else if (questionBody.points < 1) {
    throw new Error400('Point is less than 1');
  } else if (questionBody.points > 10) {
    throw new Error400('Point is greater than 10');
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
      throw new Error403('Quiz does not exist');
    }
    const quiz = isExistInTrash || isExistInQuizzesStore;
    if (quiz?.creatorId !== UserId) {
      throw new Error403('You are not the creator of the quiz');
    }
  }
}

export function allExistInTrashCheck(quizIds: string) {
  const data = getData();
  const quizIdArray: number[] = JSON.parse(quizIds);
  const result = quizIdArray.every(elementId => data.trash.some(quiz => quiz.quizId === elementId));
  if (result === false) {
    throw new Error400('Not all quizzes are in trash');
  }
}

// helper function to check if the quiz exist and the creator is the token owner
export function quizExistCheck(quizId: number, token: string) {
  const user = findUserBySessionId(getData(), token);
  const quiz = findQuizWithId(getData(), quizId);
  if (!quiz) {
    throw new Error403('Quiz does not exist');
  } else if (quiz.creatorId !== user.userId) {
    throw new Error403('You are not the creator of the quiz');
  }
}

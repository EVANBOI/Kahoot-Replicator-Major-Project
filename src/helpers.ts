import { getData } from './dataStore';
import { Data, ErrorMessage, QuestionBody, User, Quiz } from './types';

export function findUserWithId(authUserId: number) {
  return getData().users.find(user => user.userId === authUserId);
}

export function findQuizWithId(database: Data, quizId: number) {
  return database.quizzes.find(quiz => quiz.quizId === quizId);
}

export function ok<T>(item: T | { statusCode: number, error: string }): T {
  return item as T;
}

export function findUserBySessionId(database: Data, sessionIdToFind: string): User | undefined {
  return database.users.find(user =>
    user.tokens.some(tokens => tokens.token === sessionIdToFind)
  );
}
export function durationSum(database: Data, quizId: number): number {
  const quiz = findQuizWithId(database, quizId) as Quiz;
  let durationSum: number = 0;
  for (const question of quiz.questions) {
    durationSum += question.duration;
  }
  return durationSum;
}

export function validAnswers(questionBody: QuestionBody): boolean | ErrorMessage {
  const existingAnswer: string[] = [];
  for (const ans of questionBody.answers) {
    if (ans.answer.length < 1) {
      return { statusCode: 400, error: 'An answer is less than 1 character long' };
    } else if (ans.answer.length > 30) {
      return { statusCode: 400, error: 'An answer is more than 30 character long' };
    } else if (existingAnswer.find(current => current === ans.answer)) {
      return { statusCode: 400, error: 'There are duplicate answers' };
    } else {
      existingAnswer.push(ans.answer);
    }
  }
  const correctExists = questionBody.answers.some(ans => ans.correct === true);
  if (!correctExists) {
    return { statusCode: 400, error: 'There are no correct answers' };
  }
  return true;
}
/* export function findQuizBySessionId(sessionIdToFind: string): User | undefined {
  return getData().quizzes.find(q =>
      q.token.some(token => token.sessionId === sessionIdToFind)
  );
}
*/

// this function is the helper function of the adminQuizTrashEmpty, to determine if the given quiz array
// is exist in trash or quizzesStore and creator is token owner
export function isQuizExistWithCorrectCreator(token: string, quizIds: string): boolean {
  const data = getData();
  const UserId = findUserBySessionId(data, token).userId;
  const quizIdArray: number[] = JSON.parse(quizIds);
  for (const quizId of quizIdArray) {
    const isExistInTrash = data.trash.find(quiz => quiz.quizId === quizId);
    const isExistInQuizzesStore = data.quizzes.find(quiz => quiz.quizId === quizId);
    const isValidQuiz = isExistInTrash || isExistInQuizzesStore;

    if (!isValidQuiz) {
      return false;
    }
    const quiz = isExistInTrash || isExistInQuizzesStore;
    if (quiz.creatorId !== UserId) {
      return false;
    }
  }

  return true;
}

export function isAllExistInTrash(quizIds: string): boolean {
  const data = getData();
  const quizIdArray: number[] = JSON.parse(quizIds);
  const result = quizIdArray.every(elementId => data.trash.some(quiz => quiz.quizId === elementId));
  return result;
}

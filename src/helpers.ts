import { adminUserPasswordUpdate } from './auth';
import { getData } from './dataStore';
import { Data, ErrorMessage, QuestionBody, User, Quiz } from './types';

export function findUserWithId(authUserId: number) {
  return getData().users.find(user => user.userId === authUserId);
}

export function findQuizWithId(quizId: number) {
  return getData().quizzes.find(q => q.quizId === quizId);
}

export function ok<T>(item: T | { error: string }): T {
  return item as T;
}

export function findUserBySessionId(database: Data, sessionIdToFind: string): User | undefined {
  return database.users.find(user =>
    user.tokens.some(tokens => tokens.token === sessionIdToFind)
  );
}
export function durationSum(quizId: number): number {
  const quiz = findQuizWithId(quizId) as Quiz;
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
      return { statusCode: 400, error: 'An answer is less than 1 character long' };
    } else if (existingAnswer.find(current => current === ans.answer)) {
      return { statusCode: 400, error: 'There are duplicate answers' };
    } else {
      existingAnswer.push(ans.answer);
    }
  }
  const correctExists = questionBody.answers.find(ans => ans.correct === true);
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

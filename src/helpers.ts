import { getData } from './dataStore';
import { Data, User } from './types'

export function findUserWithId(authUserId: number) {
  return getData().users.find(user => user.userId === authUserId);
}

export function findQuizWithId(quizId: number) {
  return getData().quizzes.find(q => q.quizId === quizId);
}

export function ok<T>(item: T | { error: string }): T {
  return item as T;
}

export function findUserBySessionId(dataBase: Data, sessionIdToFind: string): User | undefined {
  return dataBase.users.find(user =>
      user.token.some(token => token.sessionId === sessionIdToFind)
  );
}

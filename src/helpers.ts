import { getData } from './dataStore';

export function findUserWithId(authUserId: number) {
  return getData().users.find(user => user.userId === authUserId);
}

export function findUserWithToken(sessionId: string) {
  const data = getData();
  return data.users.find(user => user.token.some(token => token.sessionId === sessionId))
}

export function findQuizWithId(quizId: number) {
  return getData().quizzes.find(q => q.quizId === quizId);
}

export function ok<T>(item: T | { error: string }): T {
  return item as T;
}

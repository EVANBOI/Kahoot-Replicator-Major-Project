import { getData } from './dataStore';

<<<<<<< HEAD:src/helpers.ts
export function findUserWithId(authUserId: number) {
    return getData().users.find(user => user.userId === authUserId);
}

export function findQuizWithId(quizId: number) {
    return getData().quizzes.find(q => q.quizId === quizId);
}
=======
export function findUserWithId(authUserId) {
  return getData().users.find(user => user.userId === authUserId);
}

export function findQuizWithId(quizId) {
  return getData().quizzes.find(q => q.quizId === quizId);
}
>>>>>>> master:src/helpers.js

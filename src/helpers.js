import { getData } from "./dataStore";

export function findUserWithId(authUserId) {
    return getData().users.find(user => user.userId === authUserId);
}

export function findQuizWithId(quizId) {
    return getData().quizzes.find(q => q.quizId === quizId);
}
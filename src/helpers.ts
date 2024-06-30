import { getData } from "./dataStore";

export function findUserWithId(authUserId: number) {
    return getData().users.find(user => user.userId === authUserId);
}

export function findQuizWithId(quizId: number) {
    return getData().quizzes.find(q => q.quizId === quizId);
}
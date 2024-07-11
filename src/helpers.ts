import { getData } from './dataStore';
import { Data, ErrorMessage, QuestionBody, User } from './types';

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

export function findQuestionInQuizId(database: Data, quizId: number, questionId: number): QuestionBody | undefined {
  const quiz = findQuizWithId(database, quizId);
  return quiz?.questions.find(question => question.questionId === questionId);
}

export function findQuestionIndex(database: Data, quizId: number, questionId: number): number {
  const quiz = findQuizWithId(database, quizId);
  return quiz?.questions.findIndex(question => question.questionId === questionId);
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

export function validQuestion(
  questionBody: QuestionBody,
  totalDuration: number
): boolean | ErrorMessage {
  if (questionBody.question.length > 50) {
    return { statusCode: 400, error: 'Question string is greater than 50 characters' };
  } else if (questionBody.question.length < 5) {
    return { statusCode: 400, error: 'Question string is less than 5 characters' };
  } else if (questionBody.answers.length < 2) {
    return { statusCode: 400, error: 'There are less than 2 answers' };
  } else if (questionBody.answers.length > 6) {
    return { statusCode: 400, error: 'There are more than 6 answers' };
  } else if (questionBody.duration < 0) {
    return { statusCode: 400, error: 'Duration is negative' };
  } else if (totalDuration > 180) {
    return { statusCode: 400, error: 'Total duration is more than 3 min' };
  } else if (questionBody.points < 1) {
    return { statusCode: 400, error: 'Point is less than 1' };
  } else if (questionBody.points > 10) {
    return { statusCode: 400, error: 'Point is greater than 10' };
  } else if (typeof validAnswers(questionBody) === 'object') {
    return validAnswers(questionBody) as ErrorMessage;
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
  const UserId = findUserBySessionId(data, token)?.userId;
  const quizIdArray: number[] = JSON.parse(quizIds);
  for (const quizId of quizIdArray) {
    const isExistInTrash = data.trash.find(quiz => quiz.quizId === quizId);
    const isExistInQuizzesStore = data.quizzes.find(quiz => quiz.quizId === quizId);
    const isValidQuiz = isExistInTrash || isExistInQuizzesStore;

    if (!isValidQuiz) {
      return false;
    }
    const quiz = isExistInTrash || isExistInQuizzesStore;
    if (quiz?.creatorId !== UserId) {
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

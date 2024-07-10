import { QuestionBody } from './types';
// here below for the function input consts
export const VALID_USER_REGISTER_INPUTS_1 = {
  EMAIL: 'admin@email.com',
  PASSWORD: 'password1',
  FIRSTNAME: 'Idk',
  LASTNAME: 'Idk',
};

export const VALID_USER_REGISTER_INPUTS_2 = {
  EMAIL: 'user@email.com',
  PASSWORD: 'password1',
  FIRSTNAME: 'Idk',
  LASTNAME: 'Idk',
};

export const VALID_QUIZ_CREATE_INPUTS_1 = {
  NAME: 'ValidQuizName',
  DESCRIPTION: 'ValidDescription'
};

export const VALID_QUIZ_CREATE_INPUTS_2 = {
  NAME: 'ValidQuizName2',
  DESCRIPTION: 'ValidDescription'
}

export const NEW_VALID_EMAIL = 'newValidEmail@gmail.com';

export const INVALID_STRINGIFIED_ARRAY_1 = '[999]';

export const INVALID_STRINGIFIED_ARRAY_2 = '[999, 9999]';

// here below for the success return consts
export const USER_DETAIL_UPDATED_SUCCESSFUL = {
  statusCode: 200,
  jsonBody: {}
};

export const CLEAR_SUCCESSFUL = {
  statusCode: 200,
  jsonBody: {}
};

export const QUIZ_TRASH_EMPTYED_SUCCESSFUL = {
    statusCode: 200,
    jsonBody: {}
};

// here below for the error return consts
export const ERROR400 = {
  statusCode: 400,
  jsonBody: { error: expect.any(String) }
};

export const ERROR401 = {
  statusCode: 401,
  jsonBody: { error: expect.any(String) }
};

export const ERROR403 = {
  statusCode: 403,
  jsonBody: { error: expect.any(String) }
};

export const validQuestion1: QuestionBody = {
  questionId: expect.any(Number),
  question: 'Valid question 1?',
  duration: 3,
  points: 2,
  answers: [
    { answerId: expect.any(Number), colour: expect.any(String), answer: 'A', correct: true },
    { answerId: expect.any(Number), colour: expect.any(String), answer: 'B', correct: false }
  ]
};

export const validQuestion2: QuestionBody = {
  questionId: expect.any(Number),
  question: 'Valid question 2?',
  duration: 150,
  points: 2,
  answers: [
    { answerId: expect.any(Number), colour: expect.any(String), answer: 'Amb', correct: false },
    { answerId: expect.any(Number), colour: expect.any(String), answer: 'Bsgd', correct: true }
  ]
};

export const validQuestion3: QuestionBody = {
  questionId: expect.any(Number),
  question: 'Valid question 3?',
  duration: 5,
  points: 2,
  answers: [
    { answerId: expect.any(Number), colour: expect.any(String), answer: 'Amb', correct: false },
    { answerId: expect.any(Number), colour: expect.any(String), answer: 'Bsgd', correct: true },
    { answerId: expect.any(Number), colour: expect.any(String), answer: 'Clsj', correct: false }
  ]
};

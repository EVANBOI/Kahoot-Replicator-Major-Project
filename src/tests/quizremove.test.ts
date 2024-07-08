import {  adminQuizRemove, adminQuizList, adminAuthRegister, clear } from '../wrappers';
import { ok } from '../helpers';
import { SessionIdObject, QuizIdObject, ErrorMessage, UserRegistrationResult, QuizCreateDetails } from '../types';
import { adminUserDetails } from '../auth';
import { adminQuizCreate } from '../quiz';

// Clear the state before each test
beforeEach(() => {
  clear();
});


const VALID_USER_INPUT = {
  EMAIL: 'admin@email.com',
  PASSWORD: 'password1',
  FIRSTNAME: 'Idk',
  LASTNAME: 'Idk'
};

//Create a valid user
const registerResponse = adminAuthRegister(
  VALID_USER_INPUT.EMAIL,
  VALID_USER_INPUT.PASSWORD,
  VALID_USER_INPUT.FIRSTNAME,
  VALID_USER_INPUT.LASTNAME
) ;

console.log(JSON.stringify(registerResponse))
const sessionId: string = ((registerResponse.jsonBody) as SessionIdObject).sessionId;
console.log(sessionId)
const validQuizz=adminQuizCreate(sessionId,"dummyquiz","This is a dummy quiz for testing")
console.log(JSON.stringify(validQuizz))
const validQuizId = (validQuizz as QuizIdObject).quizId

console.log(`::::::::::::::::::::${validQuizId}`)
console.log(`::::::::::::::::::::${sessionId}`)




//create a valid qui


test('should successfully remove a quiz', (): void => {
  const quizId = validQuizId

  const result = adminQuizRemove(sessionId, quizId);
  expect(result).toEqual({
    jsonBody: {},
    statusCode: 200,
  });

});

test('should return an error when removing a quiz with an invalid sessionId', (): void => {
  const invalidSessionId = 'invalid-session-id';
  const quizId = 123;

  const result = adminQuizRemove(invalidSessionId, quizId);

  expect(result).toStrictEqual({
    "jsonBody":  {
      error:  expect.any(String),
      },    statusCode: 401,
  });
});

test('should return an error when removing a quiz with an invalid quizId', (): void => {
  const invalidQuizId = 999; // Ensure this quizId does not exist
  const result = adminQuizRemove(sessionId, invalidQuizId)
  expect(result).toStrictEqual({
    "jsonBody":  {
      error:  expect.any(String),
      },    statusCode: 403,
  });
});

test('should return an error when removing a quiz that the user does not own', (): void => {
  const quizId = 123; // Ensure this quizId is owned by another user

  const result = adminQuizRemove(sessionId, quizId)
  expect(result).toStrictEqual({
    "jsonBody":  {
    error:  expect.any(String),
    },
    statusCode: 403,
  });
});

import request, { HttpVerb } from 'sync-request-curl';
import { port, url } from '../src/config.json';
import { QuestionBody, PositionWithTokenObj } from './types';

const SERVER_URL = `${url}:${port}`;

// The below stretch of code is taken from wrapper.test.ts in the week 5 example server
// ========================================================================= //

// Our custom return types - you can pick your own if you wish!
interface RequestHelperReturnType {
  statusCode: number;
  jsonBody?: Record<string, any>;
  error?: string;
}

/**
 * Sends a request to the given route and return its results
 *
 * Errors will be returned in the form:
 *  { statusCode: number, error: string }
 *
 * Normal responses will be in the form
 *  { statusCode: number, jsonBody: object }
 *
 * You are welcome to copy and use this function in your own code, provided
 * that you provide a reference/link to this file or repository as a comment
 * above where you are defining this function.
 * We also recommend tweaking/modifying it in accordance to your needs!
 *
 * When using this in your projects or labs, we recommend defining all of your
 * wrapper functions a separate non-test file (e.g. fakeapi.ts or testHelpers.ts)
 * and export/import them into your test files.
 *
 * This is because if you export/import YOUR_FILE.test.ts to ANOTHER.test.ts,
 * the tests in YOUR_FILE.test.ts will run twice!
 */
const requestHelper = (
  method: HttpVerb,
  path: string,
  payload: object = {}
): RequestHelperReturnType => {
  let qs = {};
  let json = {};
  if (['GET', 'DELETE'].includes(method)) {
    qs = payload;
  } else {
    // PUT/POST
    json = payload;
  }
  const res = request(method, SERVER_URL + path, { qs, json, timeout: 20000 });
  const bodyString = res.body.toString();
  let bodyObject: RequestHelperReturnType;
  try {
    // Return if valid JSON, in our own custom format
    bodyObject = {
      jsonBody: JSON.parse(bodyString),
      statusCode: res.statusCode,
    };
  } catch (error: any) {
    bodyObject = {
      error: `\
Server responded with ${res.statusCode}, but body is not JSON!

GIVEN:
${bodyString}.

REASON:
${error.message}.

HINT:
Did you res.json(undefined)?`,
      statusCode: res.statusCode,
    };
  }
  if ('error' in bodyObject) {
    // Return the error in a custom structure for testing later
    return { statusCode: res.statusCode, error: bodyObject.error };
  }
  return bodyObject;
};

//= ===========================================================================//
// Wrappers

export const adminAuthRegister = (
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string) => {
  return requestHelper('POST', '/v1/admin/auth/register',
    { email, password, nameFirst, nameLast });
};

export const adminAuthLogin = (email: string, password: string) => {
  return requestHelper('POST', '/v1/admin/auth/login', { email, password });
};

export const adminQuizCreate = (
  token: string,
  name: string,
  description: string
) => {
  return requestHelper('POST', '/v1/admin/quiz', { token: token, name, description });
};

export const adminQuizList = (token: string) => {
  return requestHelper('GET', '/v1/admin/quiz/list', { token });
};

export const adminAuthLogout = (token: string) => {
  return requestHelper('POST', '/v1/admin/auth/logout', { token });
};
export const adminQuizDescriptionUpdate = (
  token: string,
  quizId: number,
  description: string) => {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/description`,
    { token, description });
};

export const adminUserDetailsUpdate = (
  token: string,
  email: string,
  nameFirst: string,
  nameLast: string) => {
  return requestHelper('PUT', '/v1/admin/user/details',
    { token, email, nameFirst, nameLast });
};

export const adminQuizInfo = (token: string, quizId: number) => {
  return requestHelper('GET', `/v1/admin/quiz/${quizId}`, { token });
};

export const clear = () => {
  return requestHelper('DELETE', '/v1/clear', {});
};

export const adminCreateQuizQuestion = (
  quizId: number,
  token: string,
  questionBody: QuestionBody) => {
  return requestHelper('POST', `/v1/admin/quiz/${quizId}/question`,
    { token, questionBody });
};

export const adminUserPasswordUpdate = (
  token: string,
  oldPassword: string,
  newPassword: string) => {
  return requestHelper('PUT', '/v1/admin/user/password',
    { token, oldPassword, newPassword });
};

export const adminQuizNameUpdate = (
  token: string,
  quizId: number,
  name: string) => {
  return requestHelper('PUT', '/v1/admin/quiz/name',
    { token, quizId, name });
};

export const adminQuizTrashView = (token: string) => {
  return requestHelper('GET', '/v1/admin/quiz/trash', { token: token });
};

export const adminUserDetails = (token: string) => {
  return requestHelper('GET', '/v1/admin/user/details', { token });
};

export const adminQuizRemove = (token: string, quizId: number) => {
  return requestHelper('DELETE', `/v1/admin/quiz/${quizId}`, { token });
};

export const adminQuizQuestionUpdate = (
  quizid: number,
  questionid: number,
  questionBody: QuestionBody,
  token: string
) => {
  return requestHelper('PUT',
    `/v1/admin/quiz/${quizid}/question/${questionid}`,
    { questionBody, token });
};

export const adminQuizTrashEmpty = (token: string, quizIds: string) => {
  return requestHelper('DELETE', '/v1/admin/quiz/trash/empty', { token, quizIds });
};

export const adminQuizTransfer = (
  token: string,
  quizId: number,
  userEmail: string
) => {
  return requestHelper('POST', `/v1/admin/quiz/${quizId}/transfer`, { token, userEmail });
};

export const adminQuizQuestionDuplicate = (
  token: string,
  quizId: number,
  questionId: number
) => {
  return requestHelper('POST', `/v1/admin/quiz/${quizId}/question/${questionId}/duplicate`, { token });
};

export const adminQuizQuestionMove = (
  quizid: number,
  questionid: number,
  moveInfo: PositionWithTokenObj) => {
  return requestHelper('PUT', `/v1/admin/quiz/${quizid}/question/${questionid}/move`, { moveInfo });
};

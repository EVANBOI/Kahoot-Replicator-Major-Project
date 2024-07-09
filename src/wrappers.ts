import request, { HttpVerb } from 'sync-request-curl';
import { port, url } from '../src/config.json';

const SERVER_URL = `${url}:${port}`;

// The below stretch of code is taken from wrapper.test.ts in the week 5 example server
// ========================================================================= //

// Our custom return types - you can pick your own if you wish!
export interface RequestHelperReturnType {
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
  sessionId: string,
  name: string,
  description: string
) => {
  return requestHelper('POST', '/v1/admin/quiz', { token: sessionId, name, description });
};

export const adminQuizList = (sessionId: string) => {
  return requestHelper('GET', '/v1/admin/quiz/list', { sessionId });
};

export const adminQuizDescriptionUpdate = (quizId: number) => {
  return requestHelper('PUT', `/v1/admin/quia/${quizId}/description`, {});
};

export const adminUserDetailsUpdate = (
  sessionId: string,
  email: string,
  nameFirst: string,
  nameLast: string) => {
  return requestHelper('PUT', '/v1/admin/user/details',
    { sessionId, email, nameFirst, nameLast });
};

export const adminQuizInfo = (sessionId: string, quizId: number) => {
  return requestHelper('GET', `/v1/admin/quiz/${quizId}`, { sessionId });
};

export const clear = () => {
  return requestHelper('DELETE', '/v1/clear', {});
};

export const adminUserPasswordUpdate = (
  sessionId: string,
  oldPassword: string,
  newPassword: string) => {
  return requestHelper('PUT', '/v1/admin/user/password',
    { sessionId, oldPassword, newPassword });
};

export const adminQuizNameUpdate = (
  sessionId: string,
  quizId: number,
  name: string) => {
  return requestHelper('PUT', '/v1/admin/quiz/name',
    { sessionId, quizId, name });
};
export const adminQuizTrashView = (token: string) => {
  return requestHelper('GET', '/v1/admin/quiz/trash', { token });
};
export const adminUserDetails = (sessionId: string) => {
  return requestHelper('GET', '/v1/admin/user/details', { sessionId });
};

export const adminQuizRemove = (sessionId: string, quizId: number) => {
  return requestHelper('DELETE', `/v1/admin/quiz/${quizId}`, { sessionId });
};

export const adminQuizQuestionUpdate = (quizid: number, questionid: number) => {
  return requestHelper('PUT', `/v1/admin/quiz/${quizid}/question/${questionid}`, {})
}


import request, { HttpVerb } from 'sync-request-curl';
import { port, url } from '../src/config.json';

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
    { email, nameFirst, nameLast, password });
};

export const adminQuizList = (sessionId: string) => {
  return requestHelper('GET', '/v1/admin/quiz/list', { sessionId });
};

export const adminQuizDescriptionUpdate = (quizId: number) => {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/description`, {});
};

export const adminAuthLogout = (sessionsId: string) => {
    return requestHelper('POST', '/v1/admin/auth/logout', { sessionsId })
}
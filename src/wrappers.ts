import request, { HttpVerb } from 'sync-request-curl';
import { port, url } from '../src/config.json';
import { QuestionBody, PositionWithTokenObj, PositionObj, MessageObject } from './types';
import { SessionAction } from './session';

const SERVER_URL = `${url}:${port}`;

// The below stretch of code is taken from wrapper.test.ts in the week 5 example server
// ========================================================================= //

// Our custom return types - you can pick your own if you wish!
interface RequestHelperReturnType {
  statusCode: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  payload: object = {},
  token?: string
): RequestHelperReturnType => {
  let qs = {};
  let json = {};
  if (['GET', 'DELETE'].includes(method)) {
    qs = payload;
  } else {
    // PUT/POST
    json = payload;
  }
  let res;
  if (token) {
    // Add headers if they exist
    const headers = { token };
    res = request(method, SERVER_URL + path, { headers, qs, json, timeout: 20000 });
  } else {
    res = request(method, SERVER_URL + path, { qs, json, timeout: 20000 });
  }
  const bodyString = res.body.toString();
  let bodyObject: RequestHelperReturnType;
  try {
    // Return if valid JSON, in our own custom format
    bodyObject = {
      jsonBody: JSON.parse(bodyString),
      statusCode: res.statusCode,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export const adminQuizCreateV2 = (
  token: string,
  name: string,
  description: string
) => {
  return requestHelper('POST', '/v2/admin/quiz', { name, description }, token);
};

export const adminQuizList = (token: string) => {
  return requestHelper('GET', '/v1/admin/quiz/list', { token });
};

export const adminQuizListV2 = (token: string) => {
  return requestHelper('GET', '/v2/admin/quiz/list', {}, token);
};

export const adminAuthLogout = (token: string) => {
  return requestHelper('POST', '/v1/admin/auth/logout', { token });
};

export const adminAuthLogoutV2 = (token: string) => {
  return requestHelper('POST', '/v2/admin/auth/logout', {}, token);
};

export const adminQuizDescriptionUpdate = (
  token: string,
  quizId: number,
  description: string) => {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/description`,
    { token, description });
};

export const adminQuizDescriptionUpdateV2 = (
  token: string,
  quizId: number,
  description: string) => {
  return requestHelper('PUT', `/v2/admin/quiz/${quizId}/description`,
    { description }, token);
};

export const adminUserDetailsUpdate = (
  token: string,
  email: string,
  nameFirst: string,
  nameLast: string) => {
  return requestHelper('PUT', '/v1/admin/user/details',
    { token, email, nameFirst, nameLast });
};

export const adminUserDetailsUpdateV2 = (
  token: string,
  email: string,
  nameFirst: string,
  nameLast: string) => {
  return requestHelper('PUT', '/v2/admin/user/details',
    { email, nameFirst, nameLast }, token);
};

export const adminQuizInfo = (token: string, quizId: number) => {
  return requestHelper('GET', `/v1/admin/quiz/${quizId}`, { token });
};

export const adminQuizInfoV2 = (token: string, quizId: number) => {
  return requestHelper('GET', `/v2/admin/quiz/${quizId}`, {}, token);
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

export const adminCreateQuizQuestionV2 = (
  quizId: number,
  token: string,
  questionBody: QuestionBody
) => {
  return requestHelper('POST', `/v2/admin/quiz/${quizId}/question`,
    { questionBody }, token);
};

export const adminUserPasswordUpdate = (
  token: string,
  oldPassword: string,
  newPassword: string) => {
  return requestHelper('PUT', '/v1/admin/user/password',
    { token, oldPassword, newPassword });
};

export const adminUserPasswordUpdateV2 = (
  token: string,
  oldPassword: string,
  newPassword: string) => {
  return requestHelper('PUT', '/v2/admin/user/password',
    { oldPassword, newPassword }, token);
};

export const adminQuizNameUpdate = (
  token: string,
  quizId: number,
  name: string) => {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/name`,
    { token, name });
};

export const adminQuizNameUpdateV2 = (
  token: string,
  quizId: number,
  name: string) => {
  return requestHelper('PUT', `/v2/admin/quiz/${quizId}/name`, { name }, token);
};

export const adminQuizTrashView = (token: string) => {
  return requestHelper('GET', '/v1/admin/quiz/trash', { token: token });
};

export const adminQuizTrashViewV2 = (token: string) => {
  return requestHelper('GET', '/v2/admin/quiz/trash', {}, token);
};

export const adminUserDetails = (token: string) => {
  return requestHelper('GET', '/v1/admin/user/details', { token });
};

export const adminUserDetailsV2 = (token: string) => {
  return requestHelper('GET', '/v2/admin/user/details', {}, token);
};

export const adminQuizRemove = (token: string, quizId: number) => {
  return requestHelper('DELETE', `/v1/admin/quiz/${quizId}`, { token });
};

export const adminQuizRemoveV2 = (token: string, quizId: number) => {
  return requestHelper('DELETE', `/v2/admin/quiz/${quizId}`, { }, token);
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

export const adminQuizQuestionUpdateV2 = (
  quizid: number,
  questionid: number,
  questionBody: QuestionBody,
  token: string
) => {
  return requestHelper('PUT',
    `/v2/admin/quiz/${quizid}/question/${questionid}`,
    { questionBody }, token);
};

export const adminQuizTrashEmpty = (token: string, quizIds: string) => {
  return requestHelper('DELETE', '/v1/admin/quiz/trash/empty', { token, quizIds });
};

export const adminQuizTrashEmptyV2 = (token: string, quizIds: string) => {
  return requestHelper('DELETE', '/v2/admin/quiz/trash/empty', { quizIds }, token);
};

export const adminQuizTransfer = (
  token: string,
  quizId: number,
  userEmail: string
) => {
  return requestHelper('POST', `/v1/admin/quiz/${quizId}/transfer`, { token, userEmail });
};

export const adminQuizTransferV2 = (
  token: string,
  quizId: number,
  userEmail: string
) => {
  return requestHelper('POST', `/v1/admin/quiz/${quizId}/transfer`, { userEmail }, token);
};

export const adminQuizQuestionDuplicate = (
  token: string,
  quizId: number,
  questionId: number
) => {
  return requestHelper('POST', `/v1/admin/quiz/${quizId}/question/${questionId}/duplicate`, { token });
};

export const adminQuizQuestionDuplicatV2 = (
  token: string,
  quizId: number,
  questionId: number
) => {
  return requestHelper('POST', `/v2/admin/quiz/${quizId}/question/${questionId}/duplicate`, {}, token);
};

export const adminQuizRestore = (token: string, quizid: number) => {
  return requestHelper('POST', `/v1/admin/quiz/${quizid}/restore`, { token });
};

export const adminQuizQuestionDelete = (token: string, quizId: number, questionId: number) => {
  return requestHelper('DELETE', `/v1/admin/quiz/${quizId}/question/${questionId}`, { token });
};

export const adminQuizQuestionMove = (
  quizid: number,
  questionid: number,
  moveInfo: PositionWithTokenObj) => {
  return requestHelper('PUT', `/v1/admin/quiz/${quizid}/question/${questionid}/move`, moveInfo);
};

export const adminQuizQuestionMoveV2 = (
  quizid: number,
  questionid: number,
  positionObj: PositionObj,
  token: string) => {
  return requestHelper('PUT', `/v2/admin/quiz/${quizid}/question/${questionid}/move`, positionObj, token);
};

export const adminQuizSessionStatus = (
  quizid: number,
  sessionid: number,
  token: string
) => {
  return requestHelper('GET', `/v1/admin/quiz/${quizid}/session/${sessionid}`, {}, token);
};

export const playerQuestionInfo = (
  playerid: number,
  questionposition: number) => {
  return requestHelper('GET', `/v1/player/${playerid}/question/${questionposition}`, {});
};

export const playerSendMessage = (
  playerid: number,
  message: MessageObject) => {
  return requestHelper('POST', `/v1/player/${playerid}/chat`, { message });
};

export const adminQuizSessionView = (
  token: string,
  quizid: number) => {
  return requestHelper('GET', `/v1/admin/quiz/${quizid}/sessions`, {}, token);
};

export const adminQuizSessionResultLink = (
  quizid: number,
  sessionid: number,
  token: string) => {
  return requestHelper('GET', `/v1/admin/quiz/${quizid}/session/${sessionid}/results/csv`, {}, token);
};

export const playerQuestionResult = (
  playerid: number,
  questionposition: number) => {
  return requestHelper('GET', `/v1/player/${playerid}/question/${questionposition}/results`, {});
};

export const adminQuizSessionUpdate = (
  quizid: number,
  sessionid: number,
  token: string,
  action: SessionAction
) => {
  return requestHelper('PUT', `/v1/admin/quiz/${quizid}/session/${sessionid}`, { action }, token);
};

export const playerStatus = (
  playerid: number
) => {
  return requestHelper('GET', `/v1/player/${playerid}`, {});
};

export const playerChatlog = (
  playerid: number
) => {
  return requestHelper('GET', `v1/player/${playerid}/chat`, {});
};

export const adminQuizSessionStart = (
  quizid: number,
  token: string,
  autoStartNum: number
) => {
  return requestHelper('POST', `/v1/admin/quiz/${quizid}/session/start`, { autoStartNum }, token);
};

export const playerJoin = (
  sessionId: number,
  name: string
) => {
  return requestHelper('POST', '/v1/player/join', { sessionId, name });
};

export const playerResults = (
  playerid: number
) => {
  return requestHelper('GET', `/v1/player/${playerid}/results`, {});
};

export const playerQuestionAnswer = (
  playerid: number,
  questionposition: number,
  answerIds: number[]
) => {
  return requestHelper('PUT', `/v1/player/${playerid}/question/${questionposition}/answer`,
    { answerIds });
};

export const adminQuizThumbnailUpdate = (quizid: number, token: string, imgUrl: string) => {
  return requestHelper('PUT', `/v1/admin/quiz/${quizid}/thumbnail`, { imgUrl }, token);
};

export const adminQuizSessionResults = (
  quizid: number,
  sessionid: number,
  token: string
) => {
  return requestHelper('GET', `/v1/admin/quiz/${quizid}/session/${sessionid}/results`, {}, token);
};

export const getCsvData = (url: string) => {
  const res = request('GET', url);
  return res.getBody('utf8');
};

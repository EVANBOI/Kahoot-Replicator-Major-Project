import { clear } from "console"
import { adminQuizSessionStatus, adminAuthRegister, adminCreateQuizQuestionV2, adminQuizCreateV2, adminQuizQuestionUpdateV2, adminQuizSessionStart, adminQuizSessionUpdate } from "../wrappers";
import { ERROR400, ERROR401, ERROR403, validQuestion1V2 } from "../testConstants";
import { SessionAction, SessionStatus } from "../session";
import { token } from "morgan";

beforeEach(() => {
    clear();
});

let token1: string, token2: string
let quizId1: number
let questionId1: number
let sessionId1: number

beforeEach(() => {
	const { jsonBody: body1 } = adminAuthRegister(
		'admin1@ad.unsw.edu.au',
		'Passwor234d',
		'First',
		'Last');
	token1 = body1?.token;

	const { jsonBody: body2 } = adminAuthRegister(
		'admin2@ad.unsw.edu.au',
		'Passw34ord',
		'First',
		'Last');
	token2 = body2?.token;

	const { jsonBody: body3 } = adminQuizCreateV2(
		token1,
		'Quiz 1',
		'Description');
	quizId1 = body3?.quizId;

	const { jsonBody: body4 } = adminCreateQuizQuestionV2(
		quizId1,
		token1,
		validQuestion1V2);
	questionId1 = body4?.questionId;

	const { jsonBody: body5 } = adminQuizSessionStart(
		quizId1,
		token1,
		5
	);
	sessionId1 = body5?.sessionId;
});

describe('Unsuccessful Updates: 401 errors', () => {
	test.failing('Token is invalid', () => {
		expect(adminQuizSessionUpdate(quizId1, sessionId1, token1 + 1, SessionAction.END)).toStrictEqual(ERROR401);
	});

	test.failing('Token is empty', () => {
		expect(adminQuizSessionUpdate(quizId1, sessionId1, ' ', SessionAction.END)).toStrictEqual(ERROR401);
	});
});

describe('Unsuccessful Updates: 403 errors', () => {
	test.failing('Quiz does not exist', () => {
		expect(adminQuizSessionUpdate(quizId1 + 1, sessionId1, token1, SessionAction.END)).toStrictEqual(ERROR403);
	});

	test.failing('User is not an owner of the quiz', () => {
		expect(adminQuizSessionUpdate(quizId1, sessionId1, token2, SessionAction.END)).toStrictEqual(ERROR403);
	});
});

describe('Unsuccessful Updates: 400 errors', () => {
	test.failing('SessionId does not refer to valid session within this quiz', () => {
		const quizId2 = adminQuizCreateV2(token2, 'Quiz 2', '2nd description').jsonBody.quizId;
		const sessionId2 = adminQuizSessionStart(quizId2, token2, 5).jsonBody.sessionId;
		const res = adminQuizSessionUpdate(quizId1, sessionId2, token1, SessionAction.END);
    expect(res).toStrictEqual(ERROR400);
	});

	test.failing('Action provided is not a valid Action enum', () => {
		const invalidAction = 'INVALID_ACTION' as unknown as SessionAction
		expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, invalidAction)).toStrictEqual(ERROR400);
	});

	test.failing('Action has not been provided', () => {
		const res = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state;
		expect(res).toStrictEqual(SessionStatus.LOBBY);
		expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN)).toStrictEqual(ERROR400);
	})
});
import { SessionAction, SessionStatus } from "../session";
import sleepSync from 'slync';
import { ERROR400, validQuestion1V2, validQuestion2V2 } from "../testConstants";
import { adminAuthRegister, adminCreateQuizQuestionV2, adminQuizCreate, adminQuizSessionStart, adminQuizSessionUpdate, clear, playerJoin, playerStatus } from "../wrappers";

let token1: string;
let sessionId1: number;
let quizId1: number;
let questionId1: number;
let playerId1: number;
let atQuestion1: number;
let questionNum1: number;

beforeEach(() => {
  clear();
  token1 = adminAuthRegister(
    'admin1@gmail.com', 'SDFJKH2349081j', 'JJone', 'ZZ'
  ).jsonBody.token;
	const { jsonBody: body3 } = adminQuizCreate(token1, 'Quiz 1', '1st description');
	quizId1 = body3?.quizId;
	questionNum1 = body3?.numQuestions;
  questionId1 = adminCreateQuizQuestionV2(quizId1, token1, validQuestion1V2).jsonBody.questionId;
	const { jsonBody: body4 } = adminQuizSessionStart(quizId1, token1, 5);
	sessionId1 = body4?.sessionId;
	atQuestion1 = body4?.atQuestion;
  playerId1 = playerJoin(sessionId1, 'Yooiuiudsf').jsonBody.playerId;
});

describe('401 Error Case', () => {
	test('Player Id does not exist', () => {
		const result = playerStatus(playerId1 + 1);
		expect(result).toStrictEqual(ERROR400);
	});
});

describe('200 Success Case', () => {
	test.failing('Correctly return the status of a player', () => {
		const result = playerStatus(playerId1);
		expect(result).toStrictEqual({
			state: SessionStatus.LOBBY,
			numQuestions: questionNum1,
			atQuestions: atQuestion1
		});
	});

	test.failing('The status is correctly returned when the quiz has more than one question', () => {
		adminCreateQuizQuestionV2(quizId1, token1, validQuestion2V2);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
		sleepSync(validQuestion1V2.duration * 1000);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
		const result = playerStatus(playerId1);
		expect(result).toStrictEqual({
			state: SessionStatus.LOBBY,
			numQuestions: questionNum1 + 1,
			atQuestions: atQuestion1 + 1
		});		
	})
});


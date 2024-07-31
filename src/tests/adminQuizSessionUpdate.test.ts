import { clear } from "console"
import { adminQuizSessionStatus, adminAuthRegister, adminCreateQuizQuestionV2, adminQuizCreateV2, adminQuizQuestionUpdateV2, adminQuizSessionStart, adminQuizSessionUpdate } from "../wrappers";
import { ERROR400, ERROR401, ERROR403, validQuestion1V2 } from "../testConstants";
import { SessionAction, SessionStatus } from "../session";

const UPDATED = {
  statusCode: 200,
  jsonBody: { }
};
let timerId: ReturnType<typeof setTimeout>;

beforeEach(() => {
		clearTimeout(timerId);
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

	test.failing('SKIP_COUNTDOWN cannot be applied in the lobby state', () => {
		const res = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state;
		expect(res).toStrictEqual(SessionStatus.LOBBY);
		expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN)).toStrictEqual(ERROR400);
	});

	test.failing('GO_TO_ANSWER cannot be applied in the lobby state', () => {
		const res = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state;
		expect(res).toStrictEqual(SessionStatus.LOBBY);
		expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_ANSWER)).toStrictEqual(ERROR400);
	});

	test.failing('GO_TO_FINAL_RESULTS cannot be applied in the lobby state', () => {
		const res = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state;
		expect(res).toStrictEqual(SessionStatus.LOBBY);
		expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_FINAL_RESULTS)).toStrictEqual(ERROR400);		
	});

	test.failing('NEXT_QUESTION cannot be applied in the question countdown state', () => {
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
		const res = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state;
		expect(res).toStrictEqual(SessionStatus.QUESTION_COUNTDOWN);
		expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION)).toStrictEqual(ERROR400);	
	});

	test.failing('GO_TO_ANSWER cannot be applied in the question countdown state', () => {
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
		const res = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state;
		expect(res).toStrictEqual(SessionStatus.QUESTION_COUNTDOWN);
		expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_ANSWER)).toStrictEqual(ERROR400);	
	});

	test.failing('GO_TO_FINAL_RESULTS cannot be applied in the question countdown state', () => {
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
		const res = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state;
		expect(res).toStrictEqual(SessionStatus.QUESTION_COUNTDOWN);
		expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_FINAL_RESULTS)).toStrictEqual(ERROR400);		
	});

	test.failing('NEXT_QUESTION cannot be applied in the question open state', () => {
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
		const res = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state;
		expect(res).toStrictEqual(SessionStatus.QUESTION_OPEN);
		expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION)).toStrictEqual(ERROR400);		
	});

	test.failing('END cannot be applied in the question open state', () => {
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
		const res = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state;
		expect(res).toStrictEqual(SessionStatus.QUESTION_OPEN);
		expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.END)).toStrictEqual(ERROR400);			
	});

	test.failing('GO_TO_ANSWER cannot be applied in the question open state', () => {
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
		const res = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state;
		expect(res).toStrictEqual(SessionStatus.QUESTION_OPEN);
		expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_ANSWER)).toStrictEqual(ERROR400);		
	});

	test.failing('GO_TO_FINAL_RESULTS cannot be applied in the question open state', () => {
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
		const res = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state;
		expect(res).toStrictEqual(SessionStatus.QUESTION_OPEN);
		expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_FINAL_RESULTS)).toStrictEqual(ERROR400);	
	});

	test.failing('SKIP_QUESTION cannot be applied in the question open state', () => {
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
		const res = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state;
		expect(res).toStrictEqual(SessionStatus.QUESTION_OPEN);
		expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_FINAL_RESULTS)).toStrictEqual(ERROR400);			
	});

	test.failing('SKIP_COUNTDOWN cannot be applied in the question close state', () => {
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
		timerId = setTimeout(() => {
			adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state = SessionStatus.QUESTION_CLOSE
		}, 3 * 1000);
		const res = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state;
		expect(res).toStrictEqual(SessionStatus.QUESTION_CLOSE);
		expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN)).toStrictEqual(ERROR400);			
	});

	test.failing('GO_TO_ANSWER cannot be applied in the  answer show state', () => {
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_ANSWER);
		const res = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state;
		expect(res).toStrictEqual(SessionStatus.ANSWER_SHOW);
		expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_ANSWER)).toStrictEqual(ERROR400);			
	});

	test.failing('SKIP_COUNTDOWN cannot be applied in the answer show state', () => {
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_ANSWER);
		const res = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state;
		expect(res).toStrictEqual(SessionStatus.ANSWER_SHOW);
		expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN)).toStrictEqual(ERROR400);			
	});

	test.failing('NEXT_QUESTION cannot be applied in the final results state', () => {
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_ANSWER);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_FINAL_RESULTS);
		const res = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state;
		expect(res).toStrictEqual(SessionStatus.FINAL_RESULTS);
		expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION)).toStrictEqual(ERROR400);			
	});

	test.failing('SKIP_COUNTDOWN cannot be applied in the final results state', () => {
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_ANSWER);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_FINAL_RESULTS);
		const res = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state;
		expect(res).toStrictEqual(SessionStatus.FINAL_RESULTS);
		expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN)).toStrictEqual(ERROR400);			
	});

	test.failing('GO_TO_ANSWER cannot be applied in the final results state', () => {
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_ANSWER);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_FINAL_RESULTS);
		const res = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state;
		expect(res).toStrictEqual(SessionStatus.FINAL_RESULTS);
		expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_ANSWER)).toStrictEqual(ERROR400);			
	});

	test.failing('GO_TO_FINAL_RESULTS cannot be applied in the final results state', () => {
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_ANSWER);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_FINAL_RESULTS);
		const res = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state;
		expect(res).toStrictEqual(SessionStatus.FINAL_RESULTS);
		expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_FINAL_RESULTS)).toStrictEqual(ERROR400);			
	});

	test.failing('NEXT_QUESTION cannot be applied in the end state', () => {
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_ANSWER);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_FINAL_RESULTS);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.END);
		const res = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state;
		expect(res).toStrictEqual(SessionStatus.END);
		expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION)).toStrictEqual(ERROR400);			
	});

	test.failing('SKIP_COUNTDOWN cannot be applied in the end state', () => {
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_ANSWER);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_FINAL_RESULTS);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.END);
		const res = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state;
		expect(res).toStrictEqual(SessionStatus.END);
		expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN)).toStrictEqual(ERROR400);			
	});

	test.failing('GO_TO_ANSWER cannot be applied in the end state', () => {
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_ANSWER);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_FINAL_RESULTS);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.END);
		const res = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state;
		expect(res).toStrictEqual(SessionStatus.END);
		expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_ANSWER)).toStrictEqual(ERROR400);			
	});

	test.failing('GO_TO_FINAL_RESULTS cannot be applied in the end state', () => {
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_ANSWER);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_FINAL_RESULTS);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.END);
		const res = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state;
		expect(res).toStrictEqual(SessionStatus.END);
		expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_FINAL_RESULTS)).toStrictEqual(ERROR400);			
	});

	test.failing('END cannot be applied in the end state', () => {
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_ANSWER);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.GO_TO_FINAL_RESULTS);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.END);
		const res = adminQuizSessionStatus(quizId1, sessionId1, token1).jsonBody.state;
		expect(res).toStrictEqual(SessionStatus.END);
		expect(adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.END)).toStrictEqual(ERROR400);			
	});
});

describe('Successful Updates', () => {

	test('Return Correct Type', () => {
		const result = adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
		expect(result).toStrictEqual(UPDATED);
	});

	test.failing('Successfully update a session', () => {
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
    const result = adminQuizSessionStatus(quizId1, sessionId1, token1);
		expect(result).toStrictEqual({
      state: SessionStatus.QUESTION_COUNTDOWN,
      atQuestion: 0,
      players: [],
      metadata: {
        quizId: quizId1,
        name: 'Quiz 1',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: '1st description',
        numQuestions: 1,
        questions: [{
          questionId: questionId1,
          question: 'Valid question 1?',
          duration: 3,
          points: 2,
          answers: [
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: 'A',
              correct: true
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: 'B',
              correct: false
            }
          ],
          thumbnailUrl: 'http://google.com/some/image/path.jpg'
        }],
        duration: 3
      }
    });
  });

	test.failing('Successfully update a session twice', () => {
    adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.NEXT_QUESTION);
		adminQuizSessionUpdate(quizId1, sessionId1, token1, SessionAction.SKIP_COUNTDOWN);
    const result = adminQuizSessionStatus(quizId1, sessionId1, token1);
		expect(result).toStrictEqual({
      state: SessionStatus.QUESTION_OPEN,
      atQuestion: 0,
      players: [],
      metadata: {
        quizId: quizId1,
        name: 'Quiz 1',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: '1st description',
        numQuestions: 1,
        questions: [{
          questionId: questionId1,
          question: 'Valid question 1?',
          duration: 3,
          points: 2,
          answers: [
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: 'A',
              correct: true
            },
            {
              answerId: expect.any(Number),
              colour: expect.any(String),
              answer: 'B',
              correct: false
            }
          ],
          thumbnailUrl: 'http://google.com/some/image/path.jpg'
        }],
        duration: 3
      }
    });
  });
});
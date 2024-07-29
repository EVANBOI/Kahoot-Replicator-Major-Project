import { ERROR401 } from "../testConstants";
import { 
    clear, 
    adminAuthRegister, 
    adminQuizCreate, 
    adminQuizSessionStatus, 
    adminQuizSessionStart 
} from "../wrappers"

let token1: string, token2: string;
let sessionId1: number;
let quizId1: number;
beforeEach(() => {
    clear();
    token1 = adminAuthRegister(
        'admin1@gmail.com', 'SDFJKH2349081j', 'JJone', 'ZZ'
    ).jsonBody.token;
    token2 = adminAuthRegister(
        'admin2@gmail.com', 'SDFJKH2349081j', 'JJone', 'ZZ'
    ).jsonBody.token;
    quizId1 = adminQuizCreate(token1, 'Quiz 1', '1st description').jsonBody.quizId;
    sessionId1 = adminQuizSessionStart(quizId1, token1, 5).jsonBody.sessionId;
})

describe('Unsuccessful cases', () => {
    test('Error 401: token is invalid', () => {
        const res = adminQuizSessionStatus(quizId1, sessionId1, 'oioi');
        expect(res).toStrictEqual(ERROR401);
    })
    test('Error 401: token is empty')
    test('Error 403: quiz does not exist')
    test('Error 403: user is not owner of quiz')
    test('Error 400: sessionId does not refer to valid session within this quiz')
})

describe('Successful cases', () => {
    test('Successfully view session status with only 1 session existing');
    test('Successfully view session status with multiple sessionse existing')
})
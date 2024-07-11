import { clear, adminAuthRegister, adminQuizCreate, adminQuizQuestionMove } from '../wrappers';

beforeEach(() => {
    clear();
});

describe('error tests', () => {
    describe('ERROR-401 (Token invalid)', () => {
        test.todo('Token is invalid with other valid');
        test.todo('Token and quizId are invalid');
        test.todo('Token, quizId and questionId are invalid');
        test.todo('Token, quizId, questionId and position are invalid');
    });
    describe('ERROR-403 (Token valid)', () => {
        test.todo('Token is valid, but quiz doesn\'t exist');
        test.todo('Token is valid, but user is not an owner of this quiz');
        test.todo('Token is valid, but quizId and questionId are invalid');
        test.todo('Token is valid, but quizId, questionId and position are invalid');
    });
    describe('ERROR-400 (Token and quizId are valid)', () => {
        test.todo('Question Id does not refer to a valid question within this quiz');
        test.todo('NewPosition is less than 0, or NewPosition is greater than n-1 where n is the number of questions')
        test.todo('NewPosition is the position of the current question');
    });
})

describe('successful test', () => {
    test.todo('return value successful');
    test.todo('move question successful');
})
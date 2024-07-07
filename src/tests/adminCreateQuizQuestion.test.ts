import{ adminCreateQuizQuestion, adminAuthRegister, clear } from '../wrappers'

const SUCCESSFUL = {
    statusCode: 200,
    jsonBody: { questionId: expect.any(Number) }
};

beforeEach(() => {
    clear();
})

describe('Unsuccesful Tests', () => {
    describe('No users exists and expected error code is 401', () => {
        test.todo('Empty sessionId');
        test.todo('Invalid sessionId');
    });
    
    describe('Users exist', () => {
        describe('Expected error code is 400', () => {
            test.todo('Question string is less than 5 characters');
            test.todo('Question string  is more than 50 characters');
            test.todo('The question has more than 6 answers');
            test.todo('The question has less than 2 answers');
            test.todo('Question duration is not a positive number');
            test.todo('Total quiz duration exceeds 3 minutes');
            test.todo('Points awarded for the question is less than 0');
            test.todo('Points awarded frot the question is more than 10');
            test.todo('Length of answer string is less than 1 characters');
            test.todo('Length of answer string is more than 30 characters');
            test.todo('There are duplicate answer strings (in same question)')
            test.todo('There are no correct answers')
        })

        describe('Expected error code is 401', () => {
            test.todo('Invalid sessionId');
        })

        describe('Expected error code is 403', () => {
            test.todo('User is not an owner of quiz');
            test.todo('Quiz does not exist');
        })
    })
})

describe('Succesful Tests', () => {
    test.todo('Check return type');
    test.todo('Successfully make one valid question');
    test.todo('Successfully make multiple valid questions');
    test.todo('Check that questionId returned is unique for each quiz');
    test.todo('Make questions for multiple users');
})
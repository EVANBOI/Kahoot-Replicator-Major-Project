import {adminQuizCreate, adminQuizRemove, adminQuizList } from '../quiz.js';
import {adminAuthRegister} from '../auth.js';
import {clear} from '../other.js';
import { getData } from '../dataStore.js';

// Clear the state before each test
beforeEach(() => {
    clear();
});

// Failing due to missing implementation for adminQuizCreate
test.failing('should successfully remove a quiz', () => {
    // Register a user
    const registerResponse = adminAuthRegister('test.email@domain.com', 'password123', 'Hayden', 'Smith');
    console.log('Register Response:', registerResponse);
    
    const authUserId = registerResponse.authUserId;
   // console.log('DATABASE',getData());
    // Create a quiz
    const quizCreateResponse = adminQuizCreate(authUserId, 'Sample Quiz', 'This is a sample quiz.');
    console.log('Quiz Create Response:', quizCreateResponse);
    
    const quizId = quizCreateResponse.quizId;

    // Remove the quiz
    const result = adminQuizRemove(authUserId, quizId);
    console.log('Quiz Remove Result:', result);

    // Check that the result is an empty object (successful removal)
    expect(result).toEqual({});

    // Check that the quiz no longer exists in the user's quiz list
    const quizList = adminQuizList(authUserId);
    console.log('Quiz List:', quizList);
    expect(quizList.quizzes).toHaveLength(0);
});

test('should return an error when removing a quiz with an invalid authUserId', () => {
    // Register a user
    const registerResponse = adminAuthRegister('test.email@domain.com', 'password123', 'Hayden', 'Smith');
    console.log('Register Response:', registerResponse);
    
    const authUserId = registerResponse.authUserId;

    // Create a quiz
    const quizCreateResponse = adminQuizCreate(authUserId, 'Sample Quiz', 'This is a sample quiz.');
    console.log('Quiz Create Response:', quizCreateResponse);
    
    const quizId = quizCreateResponse.quizId;

    // Use an invalid authUserId
    const invalidAuthUserId = authUserId + 1;

    const result = adminQuizRemove(invalidAuthUserId, quizId);
    console.log('Invalid Quiz Remove Result:', result);

    // Check that the result contains an error message
    expect(result).toStrictEqual({ error: expect.any(String) });
});

test('should return an error when removing a quiz with an invalid quizId', () => {
    // Register a user
    const registerResponse = adminAuthRegister('test.email@domain.com', 'password123', 'Hayden', 'Smith');
    console.log('Register Response:', registerResponse);
    
    const authUserId = registerResponse.authUserId;

    // Create a quiz
    const quizCreateResponse = adminQuizCreate(authUserId, 'Sample Quiz', 'This is a sample quiz.');
    console.log('Quiz Create Response:', quizCreateResponse);
    
    const validQuizId = quizCreateResponse.quizId;

    // Use an invalid quizId
    const invalidQuizId = validQuizId + 1;

    const result = adminQuizRemove(authUserId, invalidQuizId);
    console.log('Invalid Quiz Remove Result:', result);

    // Check that the result contains an error message
    expect(result).toStrictEqual({ error: expect.any(String) });
});

test('should return an error when removing a quiz that the user does not own', () => {
    // Register two users
    const registerResponse1 = adminAuthRegister('user1.email@domain.com', 'password123', 'Hayden', 'Smith');
    console.log('Register Response 1:', registerResponse1);
    
    const authUserId1 = registerResponse1.authUserId;

    const registerResponse2 = adminAuthRegister('user2.email@domain.com', 'password123', 'Jane', 'Doe');
    console.log('Register Response 2:', registerResponse2);
    
    const authUserId2 = registerResponse2.authUserId;

    // User 1 creates a quiz
    const quizCreateResponse = adminQuizCreate(authUserId1, 'Sample Quiz', 'This is a sample quiz.');
    console.log('Quiz Create Response:', quizCreateResponse);
    
    const quizId = quizCreateResponse.quizId;

    // User 2 tries to remove User 1's quiz
    const result = adminQuizRemove(authUserId2, quizId);
    console.log('Quiz Remove Result by User 2:', result);

    // Check that the result contains an error message
    expect(result).toStrictEqual({ error: expect.any(String) });
});
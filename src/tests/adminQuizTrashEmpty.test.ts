import { clear, adminQuizTrashEmpty, adminAuthRegister, adminQuizInfo, adminQuizCreate } from '../wrappers';

const ERROR400 = {
    statusCode: 400,
    jsonBody: { error: expect.any(String) }
};

const ERROR401 = {
    statusCode: 401,
    jsonBody: { error: expect.any(String) }
};
  
const ERROR403 = {
    statusCode: 403,
    jsonBody: { error: expect.any(String) }
};

beforeEach(() => {
  clear();
});

describe('error tests', () => {
    test.todo('One or more of the Quiz IDs is not currently in the trash');
    test.todo('More of the Quiz IDs is not currently in the trash');
    test.todo('Token is empty or invalid');
    test.todo('Token valid but some of the quiz does not exsit');
    test.todo('Token valid but some of the quiz ower does not refers to current user');
});

describe('successful test', () => {
    test.todo('successful return correct value');
    test.todo('correctly delete quiz trash bin with 1 test in there');
    test.todo('correctly delete quiz trash bin with 3 tests in there');
})

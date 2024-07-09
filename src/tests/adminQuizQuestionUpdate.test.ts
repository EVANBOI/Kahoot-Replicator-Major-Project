import { adminQuizDescriptionUpdate, clear, adminAuthRegister, adminQuizCreate } from "../wrappers";

beforeEach(() => {
    clear();
  });

let sessionId: string;
let quizId: number;

beforeEach(() => {
    const { jsonBody: body1 } =
    adminAuthRegister(
      'evan.xiong@unsw.edu.au',
      'abc1234e',
      'Evan',
      'Xiong'
    );
  sessionId = body1.token;
  const { jsonBody: body2 } = adminQuizCreate(sessionId, 'Quiz 1', 'Pointers');
  quizId = body2.quizId;
})
  
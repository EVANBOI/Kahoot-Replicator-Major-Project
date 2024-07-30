import { ERROR400, ERROR401, ERROR403 } from '../testConstants';
import {
  clear,
  adminAuthRegister,
  adminQuizCreate,
  adminQuizThumbnailUpdate,
  adminQuizInfo
} from '../wrappers';

let token1: string, token2: string;
let quizId1: number;

beforeEach(() => {
    clear();
  });
  

beforeEach(() => {
  token1 = adminAuthRegister(
    'admin1@gmail.com', 'SDFJKH2349081j', 'CCC', 'LL'
  ).jsonBody.token;
  token2 = adminAuthRegister(
    'admin2@gmail.com', 'SDFJKH2349081j', 'CCC', 'LL'
  ).jsonBody.token;
  quizId1 = adminQuizCreate(token1, 'Quiz 1', '1st description').jsonBody.quizId;
});

describe('Unsuccessful cases', () => {
  test('Error 401: token is invalid', () => {
    const res = adminQuizThumbnailUpdate(quizId1, 'invalid_token', 'http://google.com/some/image/path.jpg');
    expect(res).toStrictEqual(ERROR401);
  });

  test('Error 401: token is empty', () => {
    const res = adminQuizThumbnailUpdate(quizId1, '', 'http://google.com/some/image/path.jpg');
    expect(res).toStrictEqual(ERROR401);
  });

  test('Error 403: user is not owner of quiz', () => {
    const res = adminQuizThumbnailUpdate(quizId1, token2, 'http://google.com/some/image/path.jpg');
    expect(res).toStrictEqual(ERROR403);
  });

  test('Error 400: invalid image URL format', () => {
    const invalidUrls = [
      'invalid_url',
      'http://google.com/some/image/path.bmp',
      'https://google.com/some/image/path.gif',
      'ftp://google.com/some/image/path.jpg'
    ];

    invalidUrls.forEach(url => {
      const res = adminQuizThumbnailUpdate(quizId1, token1, url);
      expect(res).toStrictEqual(ERROR400);
    });
  });
});

describe('Successful cases', () => {
  test('Successfully update quiz thumbnail', () => {
    const validUrl = 'http://google.com/some/image/path.jpg';
    const res = adminQuizThumbnailUpdate(quizId1, token1, validUrl);
    expect(res.statusCode).toBe(200);
    expect(res.jsonBody).toStrictEqual({});

    const quizInfo = adminQuizInfo(token1, quizId1).jsonBody;
    expect(quizInfo.thumbnailUrl).toBe(validUrl);
  });

  test('Successfully update quiz thumbnail with different valid URLs', () => {
    const validUrls = [
      'http://google.com/some/image/path1.jpg',
      'http://google.com/some/image/path2.jpeg',
      'http://google.com/some/image/path3.png'
    ];

    validUrls.forEach(url => {
      const res = adminQuizThumbnailUpdate(quizId1, token1, url);
      expect(res.statusCode).toBe(200);
      expect(res.jsonBody).toStrictEqual({});

      const quizInfo = adminQuizInfo(token1, quizId1).jsonBody;
      expect(quizInfo.thumbnailUrl).toBe(url);
    });
  });
  
});

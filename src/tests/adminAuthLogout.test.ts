import {
  adminAuthRegister,
  adminAuthLogout,
  clear,
  adminUserDetails,
  adminUserDetailsUpdate,
  adminUserPasswordUpdate,
  adminQuizList
} from '../wrappers';
import { ERROR401 } from '../testConstants';

const LOGOUT_SUCCESSFUL = {
  statusCode: 200,
  jsonBody: {}
};

let sessionId: string;
beforeEach(() => {
  clear();
  const { jsonBody: body } = adminAuthRegister(
    'admin1@ad.unsw.edu.au', 'Paswoord34', 'JJ', 'ZZ');
  sessionId = body?.token;
});

describe('Failure cases', () => {
  test('Session id is empty', () => {
    expect(adminAuthLogout('')).toStrictEqual(ERROR401);
  });
  test('Session Id does not exist', () => {
    expect(adminAuthLogout('-10000')).toStrictEqual(ERROR401);
  });
});

describe('Success cases', () => {
  describe('Only one user exists in database', () => {
    test('Check if it returns an empty object', () => {
      expect(adminAuthLogout(sessionId)).toStrictEqual(LOGOUT_SUCCESSFUL);
    });

    test('Successful logout - cannot check user details', () => {
      adminAuthLogout(sessionId);
      expect(adminUserDetails(sessionId)).toStrictEqual(ERROR401);
    });
    test('Successful logout - cannot update user details', () => {
      adminAuthLogout(sessionId);
      expect(adminUserDetailsUpdate(
        sessionId,
        'adminwoeiru@gmail.com',
        'First',
        'Last')).toStrictEqual(ERROR401);
    });
    test('Successful logout - cannot change user password', () => {
      adminAuthLogout(sessionId);
      expect(adminUserPasswordUpdate(
        sessionId,
        'Paswoor34',
        'NewPaswoor34')).toStrictEqual(ERROR401);
    });
    test('Successful logout - cannot view quiz list', () => {
      adminAuthLogout(sessionId);
      expect(adminQuizList(sessionId)).toStrictEqual(ERROR401);
    });
    test('Logout twice, cannot the second time', () => {
      adminAuthLogout(sessionId);
      expect(adminAuthLogout(sessionId)).toStrictEqual(ERROR401);
    });
  });

  describe('There are multiple users in database', () => {
    let sessionId2: string, sessionId3: string;
    beforeEach(() => {
      const { jsonBody: body2 } = adminAuthRegister(
        'admin2@ad.unsw.edu.au', 'Paswoor34', 'JJ', 'ZZ');
      sessionId2 = body2?.token;
      const { jsonBody: body3 } = adminAuthRegister(
        'admin3@ad.unsw.edu.au', 'Paswoor34', 'JJ', 'ZZ');
      sessionId3 = body3?.token;
    });
    test('Successful logout of one user', () => {
      expect(adminAuthLogout(sessionId2)).toStrictEqual(LOGOUT_SUCCESSFUL);
    });
    test('Successful logout of multiple users', () => {
      adminAuthLogout(sessionId);
      adminAuthLogout(sessionId2);
      expect(adminAuthLogout(sessionId3)).toStrictEqual(LOGOUT_SUCCESSFUL);
    });
  });
});

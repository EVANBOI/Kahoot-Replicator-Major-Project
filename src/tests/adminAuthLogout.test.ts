import {
  adminAuthRegister,
  adminAuthLogout,
  adminAuthLogoutV2,
  clear,
  adminUserDetails,
  adminUserDetailsUpdate,
  adminUserPasswordUpdate,
  adminQuizList,
  adminAuthLogin
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

describe('Failure case for v1', () => {
  test('Session id is empty', () => {
    expect(adminAuthLogout('')).toStrictEqual(ERROR401);
  });
});

describe('Success case for v1', () => {
  test('Check if it returns an empty object', () => {
    expect(adminAuthLogout(sessionId)).toStrictEqual(LOGOUT_SUCCESSFUL);
  });    
});

//============================================================================//
// v2 route tests
describe('Failure cases for v2', () => {
  test('Session id is empty', () => {
    expect(adminAuthLogoutV2('')).toStrictEqual(ERROR401);
  });
  test('Session Id does not exist', () => {
    expect(adminAuthLogoutV2('-10000')).toStrictEqual(ERROR401);
  });
});

describe('Success cases for v2', () => {
  describe('Only one user exists in database', () => {
    test('Check if it returns an empty object', () => {
      expect(adminAuthLogoutV2(sessionId)).toStrictEqual(LOGOUT_SUCCESSFUL);
    });

    test('Successful logout - cannot check user details', () => {
      adminAuthLogoutV2(sessionId);
      expect(adminUserDetails(sessionId)).toStrictEqual(ERROR401);
    });
    test('Successful logout - cannot update user details', () => {
      adminAuthLogoutV2(sessionId);
      expect(adminUserDetailsUpdate(
        sessionId,
        'adminwoeiru@gmail.com',
        'First',
        'Last')).toStrictEqual(ERROR401);
    });
    test('Successful logout - cannot change user password', () => {
      adminAuthLogoutV2(sessionId);
      expect(adminUserPasswordUpdate(
        sessionId,
        'Paswoor34',
        'NewPaswoor34')).toStrictEqual(ERROR401);
    });
    test('Successful logout - cannot view quiz list', () => {
      adminAuthLogoutV2(sessionId);
      expect(adminQuizList(sessionId)).toStrictEqual(ERROR401);
    });
    test('Log in and then logout successfully', () => {
      const loginId = adminAuthLogin('admin1@ad.unsw.edu.au', 'Paswoord34').jsonBody?.token;
      expect(adminAuthLogoutV2(loginId)).toStrictEqual(LOGOUT_SUCCESSFUL);
    });
    test('Logout twice, cannot the second time', () => {
      adminAuthLogoutV2(sessionId);
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
      expect(adminAuthLogoutV2(sessionId2)).toStrictEqual(LOGOUT_SUCCESSFUL);
    });
    test('Successful logout of multiple users', () => {
      adminAuthLogoutV2(sessionId);
      adminAuthLogoutV2(sessionId2);
      expect(adminAuthLogoutV2(sessionId3)).toStrictEqual(LOGOUT_SUCCESSFUL);
    });
  });
});
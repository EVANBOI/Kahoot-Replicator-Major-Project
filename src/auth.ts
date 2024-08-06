import { getData, setData } from './wrappers';
import validator from 'validator';
import { findUserBySessionId, getHashOf } from './helpers';
import { Data, UserRegistrationResult, PasswordUpdateResult, UserUpdateResult, Userdetails, ErrorMessage, EmptyObject } from './types';
import { BadRequest, Unauthorised } from './error';
import ShortUniqueId from 'short-unique-id';
const uid = new ShortUniqueId({ dictionary: 'number' });
/**
 * Given an admin user's details, creates an account for them.
 *
 * @param {string} email - unique email of a user
 * @param {string} password - password for a user's login
 * @param {string} nameFirst - first name of a user
 * @param {string} nameLast - last name of a user
 * @returns {{token: number}}
 * @returns {ErrorMessage} an error
 */
export function adminAuthRegister (
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string): UserRegistrationResult {
  const dataBase = getData();
  const person = dataBase.users.find(person => person.email === email);
  if (person) {
    throw new BadRequest('Email address is used by another user.');
  }
  const nameRange = /^[a-zA-Z-' ]*$/;
  const passwordLetterRange = /^[a-zA-Z]/;
  const passwordNumberRange = /[0-9]/;
  if (!validator.isEmail(email)) {
    throw new BadRequest('Email is not a valid email');
  } else if (!nameRange.test(nameFirst)) {
    throw new BadRequest('NameFirst contains invalid characters');
  } else if (nameFirst.length < 2 || nameFirst.length > 20) {
    throw new BadRequest('NameFirst is less than 2 characters or more than 20 characters.');
  } else if (!nameRange.test(nameLast)) {
    throw new BadRequest('NameFirst contains invalid characters');
  } else if (nameLast.length < 2 || nameLast.length > 20) {
    throw new BadRequest('NameLast is less than 2 characters or more than 20 characters.');
  } else if (password.length < 8) {
    throw new BadRequest('Password is less than 8 characters.');
  } else if (!passwordLetterRange.test(password) || !passwordNumberRange.test(password)) {
    throw new BadRequest('Password does not contain at least one number and at least one letter.');
  }

  const id = dataBase.users.length + 1;
  const token = { token: uid.rnd() };
  dataBase.users.push({
    userId: id,
    tokens: [token],
    email: email,
    password: getHashOf(password),
    name: `${nameFirst} ${nameLast}`,
    numSuccessfulLogins: 1,
    numFailedPasswordsSinceLastLogin: 0,
    passwordUsedThisYear: []
  });
  setData(dataBase);
  return token;
}

/**
 * Given an admin user's authUserId and a set of properties,
 * update the properties of this logged in admin user.
 *
 * @param {string} token - unique session id of a user
 * @param {string} email - unique email of a user
 * @param {string} nameFirst - first name of a user
 * @param {string} nameLast - last name of a user
 * @returns {} - empty object
 */
export function adminUserDetailsUpdate (
  token: string,
  email: string,
  nameFirst: string,
  nameLast: string
): UserUpdateResult {
  const dataBase = getData();
  // to cover the case when we do not make change of the email
  // (the update email === original email)
  const person = dataBase.users.find(person => person.email === email);
  if (person) {
    const isCorrectOwner = person.tokens.find(tokens => tokens.token === token);
    if (!isCorrectOwner) {
      throw new BadRequest('Email address is used by another user.');
    }
  }

  const nameRange = /^[a-zA-Z-' ]*$/;
  if (!validator.isEmail(email)) {
    throw new BadRequest('Email is not valid');
  } else if (!nameRange.test(nameFirst)) {
    throw new BadRequest('NameFirst contains invalid characters');
  } else if (nameFirst.length < 2 || nameFirst.length > 20) {
    throw new BadRequest('NameFirst is less than 2 characters or more than 20 characters.');
  } else if (!nameRange.test(nameLast)) {
    throw new BadRequest('NameLast contains invalid characters');
  } else if (nameLast.length < 2 || nameLast.length > 20) {
    throw new BadRequest('NameLast is less than 2 characters or more than 20 characters.');
  }

  const user = findUserBySessionId(dataBase, token);
  user.email = email;
  user.name = `${nameFirst} ${nameLast}`;
  setData(dataBase);

  return {};
}

/**
 * Given a registered user's email and password returns their authUserId value.
 *
 * @param {string} email - unique email of a user
 * @param {string} password - password for a user's account
 * @returns {{token: string}} - a unique session id of a user
 * @returns {ErrorMessage} - an error
 */
export function adminAuthLogin (
  email : string,
  password: string): UserRegistrationResult {
  const dataBase = getData();

  const validEmail = dataBase.users.find(user => user.email === email);
  const correctPassword = dataBase.users.find(user =>
    user.email === email &&
    user.password === getHashOf(password));
  if (!validEmail) {
    throw new BadRequest('Email address does not exist.');
  } else if (!correctPassword) {
    validEmail.numFailedPasswordsSinceLastLogin += 1;
    setData(dataBase);
    throw new BadRequest('Password is not correct for the given email.');
  }

  correctPassword.numFailedPasswordsSinceLastLogin = 0;
  correctPassword.numSuccessfulLogins += 1;
  const token = { token: uid.rnd() };
  correctPassword.tokens.push(token);
  setData(dataBase);

  return token;
}

/**
 * Given an admin user's sessionId, return details about the user.
 * "name" is the first and last name concatenated with a single space between them.
 * @param {string} sessionId - unique id of a user
 * @returns {{user:
 *              {userId: number,
 *               name: string,
 *               email: string,
 *               numSuccessfulLogins: number,
 *               numFailedPasswordsSinceLastLogin: number
 * }}
 * }
 * @returns {ErrorMessage} - an error message
 */
export function adminUserDetails (sessionId: string): Userdetails {
  const database = getData();
  const user = findUserBySessionId(database, sessionId);
  if (!user) {
    throw new Unauthorised('SessionId is not a valid user.');
  }

  return {
    user:
        {
          userId: user.userId,
          name: user.name,
          email: user.email,
          numSuccessfulLogins: user.numSuccessfulLogins,
          numFailedPasswordsSinceLastLogin: user.numFailedPasswordsSinceLastLogin,
        }
  };
}

/**
 * Given details relating to a password change, update the password of a logged in user.
 *
 * @param {string} sessionId - unique session id of a user
 * @param {string} oldPassword - current password of a user's account
 * @param {string} newPassword - new password to replace old password
 * @returns {} - empty object
 * @returns {ErrorMessage} - error code
 */
export function adminUserPasswordUpdate(
  sessionId: string,
  oldPassword: string,
  newPassword: string
): PasswordUpdateResult {
  const dataBase: Data = getData();
  const user = findUserBySessionId(dataBase, sessionId);

  if (user.password !== getHashOf(oldPassword)) {
    throw new BadRequest('Old Password is not the correct old password');
  }

  if (getHashOf(oldPassword) === getHashOf(newPassword)) {
    throw new BadRequest('Old Password and New Password match exactly');
  }
  if (user.passwordUsedThisYear.includes(getHashOf(newPassword))) {
    throw new BadRequest('New Password has already been used before by this user');
  }
  if (newPassword.length < 8) {
    throw new BadRequest('Password should be more than 8 characters');
  }
  if (!/\d/.test(newPassword) || !/[a-zA-Z]/.test(newPassword)) {
    throw new BadRequest('Password needs to contain at least one number and at least one letter');
  }
  user.passwordUsedThisYear.push(getHashOf(oldPassword));
  user.password = getHashOf(newPassword);
  setData(dataBase);
  return {};
}

/**
 * Given the session id (token), logout the user of that particular session.
 *
 * @param {string} sessionId - unique session id of a user, users can have multiple
 * @returns {} - empty object
 * @returns {ErrorMessage} - error code
 */
export function adminAuthLogout(sessionId: string): ErrorMessage | EmptyObject {
  const database = getData();
  const user = findUserBySessionId(database, sessionId);
  const index = user.tokens.findIndex(token => token.token === sessionId);
  user.tokens.splice(index, 1);
  setData(database);
  return {};
}

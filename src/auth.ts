import { getData, setData } from './dataStore';
import validator from 'validator';
import { findUserBySessionId } from './helpers';
import { Data, UserRegistrationResult, PasswordUpdateResult, UserUpdateResult, Userdetails } from './types';
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
 * @returns {{error: string}} an error
 */
export function adminAuthRegister (
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string): UserRegistrationResult {
  const dataBase = getData();
  const person = dataBase.users.find(person => person.email === email);
  if (person) {
    return { statusCode: 400, error: 'Email address is used by another user.' };
  }
  const nameRange = /^[a-zA-Z-' ]*$/;
  const passwordLetterRange = /^[a-zA-Z]/;
  const passwordNumberRange = /\d/;
  if (!validator.isEmail(email)) {
    return { statusCode: 400, error: 'Email is not a valid email' };
  } else if (!nameRange.test(nameFirst)) {
    return { statusCode: 400, error: 'NameFirst contains invalid characters' };
  } else if (nameFirst.length < 2 || nameFirst.length > 20) {
    return { statusCode: 400, error: 'NameFirst is less than 2 characters or more than 20 characters.' };
  } else if (!nameRange.test(nameLast)) {
    return { statusCode: 400, error: 'NameFirst contains invalid characters' };
  } else if (nameLast.length < 2 || nameLast.length > 20) {
    return { statusCode: 400, error: 'NameLast is less than 2 characters or more than 20 characters.' };
  } else if (password.length < 8) {
    return { statusCode: 400, error: 'Password is less than 8 characters.' };
  } else if (!passwordLetterRange.test(password) || !passwordNumberRange.test(password)) {
    return { statusCode: 400, error: 'Password does not contain at least one number and at least one letter.' };
  }

  const id = dataBase.users.length + 1;
  const token = { token: uid.rnd() };
  dataBase.users.push({
    userId: id,
    tokens: [token],
    email: email,
    password: password,
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
 * @param {string} sessionId - unique id of a user
 * @param {string} email - unique email of a user
 * @param {string} nameFirst - first name of a user
 * @param {string} nameLast - last name of a user
 * @returns {} - empty object
 */
export function adminUserDetailsUpdate (
  sessionId: string,
  email: string,
  nameFirst: string,
  nameLast: string
): UserUpdateResult {
  const dataBase = getData();
  const person2 = findUserBySessionId(dataBase, sessionId);
  if (!person2) {
    return { statusCode: 401, error: 'sessionId provided is invalid' };
  }

  // to cover the case when we do not make change of the email
  // (the update email === original email)
  const person = dataBase.users.find(person => person.email === email);
  if (person) {
    const isCorrectOwner = person.tokens.find(tokens => tokens.token === sessionId);
    if (!isCorrectOwner) {
      return { statusCode: 400, error: 'Email address is used by another user.' };
    }
  }

  const nameRange = /^[a-zA-Z-' ]*$/;
  if (!validator.isEmail(email)) {
    return { statusCode: 400, error: 'Email is not valid' };
  } else if (!nameRange.test(nameFirst)) {
    return { statusCode: 400, error: 'NameFirst contains invalid characters' };
  } else if (nameFirst.length < 2 || nameFirst.length > 20) {
    return { statusCode: 400, error: 'NameFirst is less than 2 characters or more than 20 characters.' };
  } else if (!nameRange.test(nameLast)) {
    return { statusCode: 400, error: 'NameLast contains invalid characters' };
  } else if (nameLast.length < 2 || nameLast.length > 20) {
    return { statusCode: 400, error: 'NameLast is less than 2 characters or more than 20 characters.' };
  }

  person2.email = email;
  person2.name = `${nameFirst} ${nameLast}`;
  setData(dataBase);

  return {};
}

/**
 * Given a registered user's email and password returns their authUserId value.
 *
 * @param {string} email - unique email of a user
 * @param {string} password - password for a user's account
 * @returns {{token: string}}
 */
export function adminAuthLogin (
  email : string,
  password: string): UserRegistrationResult {
  const dataBase = getData();

  const validEmail = dataBase.users.find(user => user.email === email);
  const correctPassword = dataBase.users.find(user =>
    user.email === email &&
        user.password === password);
  if (!validEmail) { // if validEmail is undefined, the condition is true
    return { statusCode: 400, error: 'email address does not exist' };
  } else if (!correctPassword) {
    validEmail.numFailedPasswordsSinceLastLogin += 1;
    setData(dataBase);
    return { statusCode: 400, error: 'password is not correct for the given email' };
  }

  correctPassword.numFailedPasswordsSinceLastLogin = 0;
  correctPassword.numSuccessfulLogins += 1;
  const token = { token: uid.rnd() };
  correctPassword.tokens.push(token);
  setData(dataBase);

  return token;
}

/**
 * Given an admin user's authUserId, return details about the user.
 * "name" is the first and last name concatenated with a single space between them.
 * @param {string} sessionId - unique id of a user
 * @returns {{user:
 *              {userId: number,
 *               name: string,
 *               email: string,
 *               numSuccessfulLogins: number,
 *               numFailedPasswordsSinceLastLogin: number}}}
 */

export function adminUserDetails (sessionId: string): Userdetails {
  const database = getData();
  const user = findUserBySessionId(database, sessionId);
  if (!user) {
    return { statusCode: 401, error: 'sessionId is not a valid user.' };
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
 * @param {number} authUserId - unique id of a user
 * @param {string} oldPassword - current password of a user's account
 * @param {string} newPassword - new password to replace old password
 * @returns {} - empty object
 */

export function adminUserPasswordUpdate(sessionId: string, oldPassword: string, newPassword: string): PasswordUpdateResult {
  const dataBase: Data = getData();
  const user = findUserBySessionId(dataBase, sessionId);

  if (!user) {
    return { error: 'sessionId is not valid.' };
  }
  if (user.password !== oldPassword) {
    return { error: 'Old Password is not the correct old password' };
  }
  if (oldPassword === newPassword) {
    return { error: 'Old Password and New Password match exactly' };
  }
  if (user.passwordUsedThisYear.includes(newPassword)) {
    return { error: 'New Password has already been used before by this user' };
  }
  if (newPassword.length < 8) {
    return { error: 'Password should be more than 8 characters' };
  }
  if (!/\d/.test(newPassword) || !/[a-zA-Z]/.test(newPassword)) {
    return { error: 'Password needs to contain at least one number and at least one letter' };
  }

  if (user.passwordUsedThisYear.find(pw => pw === newPassword)) {
    return { error: 'New Password has already been used before by this user' };
  }
  user.passwordUsedThisYear.push(oldPassword);
  user.password = newPassword;
  setData(dataBase);
  return {};
}

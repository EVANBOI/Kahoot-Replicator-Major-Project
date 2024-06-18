import { getData, setData } from "./dataStore.js";
import validator from 'validator';

/**
 * Given an admin user's details, creates an account for them.
 * 
 * @param {string} email - unique email of a user
 * @param {string} password - password for a user's login
 * @param {string} nameFirst - first name of a user
 * @param {string} nameLast - last name of a user
 * @returns {{authUserId: number}}
 */
export function adminAuthRegister (email, password, nameFirst, nameLast) {
    let dataBase = getData();
    const person = dataBase.users.find(person => person.email === email)
    if (person) {
        return { error: 'Email address is used by another user.'};
    }
    const nameRange = /^[a-zA-Z-' ]*$/
    const passwordLetterRange = /^[a-zA-Z]/;
    const passwordNumberRange = /\d/;
    if (validator.isEmail(email) == false) {
        return { error: 'Email does not satisfy this: https://www.npmjs.com/package/validator (validator.isEmail function).'}
    }else if (!nameRange.test(nameFirst)) {
        return { error: 'NameFirst contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes.'}
    } else if (nameFirst.length < 2 || nameFirst.length > 20) {
        return { error: 'NameFirst is less than 2 characters or more than 20 characters.'}
    } else if (!nameRange.test(nameLast)) {
        return { error: 'NameLast contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes.'};
    } else if (nameLast.length < 2 || nameLast.length > 20) {
        return { error: 'NameLast is less than 2 characters or more than 20 characters.'}
    } else if (password.length < 8) {
        return { error : 'Password is less than 8 characters.'};
    } else if (!passwordLetterRange.test(password) || !passwordNumberRange.test(password)) {
        return { error: 'Password does not contain at least one number and at least one letter.'}
    }

    const id = dataBase.users.length + 1;
    dataBase.users.push({
        userId: id,
        email: email,
        password: password,
        name: `${nameFirst} ${nameLast}`
    });
    setData(dataBase);
    return {
        authUserId: id
    }
}

/**
 * Given an admin user's authUserId and a set of properties, 
 * update the properties of this logged in admin user.
 * 
 * @param {number} authUserId - unique id of a user
 * @param {string} email - unique email of a user
 * @param {string} nameFirst - first name of a user
 * @param {string} nameLast - last name of a user
 * @returns {} - empty object
 */
export function adminUserDetailsUpdate (authUserId, email, nameFirst, nameLast) {
    let dataBase = getData();

    const person2 = dataBase.users.find(person => person.userId === authUserId);
    if (!person2) {
        return { error: 'UserId provided is invalid' }
    }


    const person = dataBase.users.find(person => person.email === email);
    // to cover the case when we do not make change of the email
    // (the update email === original email)
    if (person && person.userId !== authUserId) {
        return { error: 'Email address is used by another user.'};
    }

    const nameRange = /^[a-zA-Z-' ]*$/
    if (!validator.isEmail(email)) {
        return { error: 'Email does not satisfy this: https://www.npmjs.com/package/validator (validator.isEmail function).'}
    }else if (!nameRange.test(nameFirst)) {
        return { error: 'NameFirst contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes.'}
    } else if (nameFirst.length < 2 || nameFirst.length > 20) {
        return { error: 'NameFirst is less than 2 characters or more than 20 characters.'}
    } else if (!nameRange.test(nameLast)) {
        return { error: 'NameLast contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes.'};
    } else if (nameLast.length < 2 || nameLast.length > 20) {
        return { error: 'NameLast is less than 2 characters or more than 20 characters.'}
    }

    const user = dataBase.users.find(user => user.userId === authUserId);
    user.email = email;
    user.name = `${nameFirst} ${nameLast}`;
    setData(dataBase);


    return { 

    }
}

/**
 * Given a registered user's email and password returns their authUserId value.
 * 
 * @param {string} email - unique email of a user
 * @param {string} password - password for a user's account
 * @returns {{authUserId: number}}
 */
export function adminAuthLogin (email, password) {

    let dataBase = getData();

    const validEmail = dataBase.users.find(user => user.email === email);
    const correctPassword = dataBase.users.find(user => user.email === email 
                                                && user.password === password);
    if (!validEmail) { // if validEmail is undefined, the condition is true
        return { error: 'email address does not exist'};
    } else if (!correctPassword) {
        return { error: 'password is not correct for the given email'};
    }

    return {
        authUserId: correctPassword.userId
    }
}

/**
 * Given an admin user's authUserId, return details about the user.
 * "name" is the first and last name concatenated with a single space between them.
 * 
 * @param {number} authUserId - unique id of a user
 * @returns {{user: {userId: number, name: string, email: string, numSuccessfulLogins: number, numFailedPasswordsSinceLastLogin: number}}}
 */
export function adminUserDetails (authUserId) {

    return {user:
        {
            userId: 1,
            name: 'Hayden Smith',
            email: 'hayden.smith@unsw.edu.au',
            numSuccessfulLogins: 3,
            numFailedPasswordsSinceLastLogin: 1,
        }
    }
}

/**
 * Given details relating to a password change, update the password of a logged in user.
 * 
 * @param {number} authUserId - unique id of a user
 * @param {string} oldPassword - current password of a user's account
 * @param {string} newPassword - new password to replace old password
 * @returns {} - empty object
 */
export function adminUserPasswordUpdate(authUserId,oldPassword, newPassword){
    return {

    };
}
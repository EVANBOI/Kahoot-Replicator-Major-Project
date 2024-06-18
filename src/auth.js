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
    return {
        authUserId: 1
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
    return {
        authUserId: 1
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
import { getData, setData } from './dataStore';
export function adminUserPasswordUpdate(authUserId,oldPassword, newPassword){
    const data = global.data || getData();
    const user = data.users.find(user => user.userId === authUserId);
    
    if(!user){
        return {error : 'AuthUserId is not a valid user.'};
    }
    if(user.password !== oldPassword){
        return{ error : "Old Password is not the correct old password"};
    }
    if(oldPassword === newPassword){
        return{ error : 'Old Password and New Password match exactly'};
    }
    if(user.usedPasswords.includes(newPassword)){
        return {error : 'New Password has already been used before by this user'};
    }
    if(newPassword.length < 8){
        return{error : ' Password should more than 8 characters'};
    }
    if(!/\d/.test(newPassword) || !/[a-zA-z]/.test(newPassword)){
        return{error : ' Password need contain at least one number and at least one letter'};
    };
    
    user.password = newPassword;
    user.usedPasswords.push(newPassword);
    return {};


}



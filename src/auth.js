import {data, getData, setData} from './dataStore.js';


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


function adminUserDetails (authUserId) {
    

    const store = getData();

    const user = store.users.find(user => user.authUserId === authUserId);
    if (!user) {
        return { error: 'AuthUserId is not a valid user.' };
    }

    return {user:
        {
            userId: user.userId,
            name: `${user.nameFirst} ${user.nameLast}`,
            email: user.email,
            numSuccessfulLogins: user.numSuccessfulLogins,
            numFailedPasswordsSinceLastLogin: user.numFailedPasswordsSinceLastLogin,
        }
    };
}
console.log(adminUserDetails(1));

export {adminUserDetails};
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


/**
 * Given an admin user's details, creates an account for them.
 * 
 * @param {string} email - unique email for a user
 * @param {string} password - password for a user's login
 * @param {string} nameFirst - first name of a user
 * @param {string} nameLast - last name of a user
 * @returns {{authUserId: number}}
 */
function adminAuthRegister (email, password, nameFirst, nameLast) {
    return {
        authUserId: 1
    }
}

// Function

function adminUserDetailsUpdate (authUserId, email, nameFirst, nameLast) {
    return { 

    }
}


function adminAuthLogin (email, password) {
    return {
        authUserId: 1
    }
}


function adminUserDetails (authUserId) {

    return { user:
        {
            userId: 1,
            name: 'Hayden Smith',
            email: 'hayden.smith@unsw.edu.au',
            numSuccessfulLogins: 3,
            numFailedPasswordsSinceLastLogin: 1,
        }
    }
}


function adminUserPasswordUpdate(authUserId,oldPassword, newPassword){
    return {};
}
// Function

function adminUserDetailsUpdate (authUserId) {
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
export type EmptyObject = { };

export type ErrorMessage = { error: string };

export type ClearResult = EmptyObject;

export type UserUpdateResult = EmptyObject | ErrorMessage;

export type UserRegistrationResult = ErrorMessage | {
    authUserId: number
}

export type User = {
    userId: number,
    email: string,
    password: string,
    name: string,
    numSuccessfulLogins: number,
    numFailedPasswordsSinceLastLogin: number,
    passwordUsedThisYear: string[]
}

export type Quiz = {
    creatorId: number,
    quizId: number,
    name: string,
    timeCreated: number,
    timeLastEdited: number,
    description: string
}

export type Data = {
    users: User[],
    quizzes: Quiz[]
}

export type QuizListDetails = ErrorMessage | {
    quizzes: {
        quizId: number
        name: string,
    }[]
} // need to check if this works correctly

export type QuizInfoResult = ErrorMessage | {
    quizId: number,
    name: string,
    timeCreated: number,
    timeLastEdited: number,
    description: string
}

export type QuizCreateDetails = ErrorMessage | {
    quizId: number
}

export type PasswordUpdateResult = EmptyObject | ErrorMessage;


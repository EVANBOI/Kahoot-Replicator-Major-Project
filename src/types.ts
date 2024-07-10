// Types for errors
export type ErrorMessage = {
    statusCode: number,
    error: string };

export type Status = {
    statusCode: number,
    message: string
}

// Id types
export type Token = { token: string }
export type QuizIdObject = {
    quizId: number
}

export type AuthUserIdObject = {
    token: string
}

export type SessionIdObject = {
    status: number,
    token: string
};

// Types for dataStore
export type User = {
    userId: number,
    tokens: Token[],
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
    quizzes: Quiz[],
    trash: Quiz[]
}

// Types for function return
export type EmptyObject = Record<string, never>;
export type ClearResult = EmptyObject;
export type UserUpdateResult = EmptyObject | ErrorMessage
export type UserRegistrationResult = ErrorMessage | Token;

export type QuizListDetails = ErrorMessage | {
    quizzes: {
        quizId: number
        name: string,
    }[]
}

export type QuizInfoResult = ErrorMessage | {
    quizId: number,
    name: string,
    timeCreated: number,
    timeLastEdited: number,
    description: string
}

export type UserdetailsResults = {
    userId: number,
    tokens: Token[],
    name: string,
    email: string,
    numSuccessfulLogins: number,
    numFailedPasswordsSinceLastLogin: number,
}

export type QuizCreateDetails = {
    body: {
        quizId: number
    },
    status: number
}

export type PasswordUpdateResult = EmptyObject | ErrorMessage;

export type QuizRemoveResult = Status;

export type Userdetails = ErrorMessage | {user: {
    userId: number,
    name: string,
    email: string,
    numSuccessfulLogins: number,
    numFailedPasswordsSinceLastLogin: number
}}

export type QuizNameUpdateResult = EmptyObject | ErrorMessage;

export type QuizTransferResult = EmptyObject | ErrorMessage;

export type Error = {
    statusCode: number,
    message: string
}

export type TrashViewDetails = ErrorMessage | {
    quizzes: {
        quizId: number
        name: string,
    }[]
}

import internal from "stream";

export type EmptyObject = Record<string, never>;

export type ErrorMessage = { error: string };
export type SessionId = { sessionId: string }
export type User = {
    userId: number,
    token: SessionId[],
    email: string,
    password: string,
    name: string,
    numSuccessfulLogins: number,
    numFailedPasswordsSinceLastLogin: number,
    passwordUsedThisYear: string[]
}
export type UserdetailsResults = {
    userId: number,
    token: SessionId[],
    name: string,
    email: string,
    numSuccessfulLogins: number,
    numFailedPasswordsSinceLastLogin: number,
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

export type QuizIdObject = {
    quizId: number
}

export type AuthUserIdObject = {
    sessionId: string
}

export type ClearResult = EmptyObject;

export type UserUpdateResult = EmptyObject | ErrorMessage;

export type UserRegistrationResult = ErrorMessage | SessionId;

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

export type SessionIdObject = {
    sessionId: string
    status: number
  };

export type QuizCreateDetails = ErrorMessage | QuizIdObject

export type PasswordUpdateResult = EmptyObject | ErrorMessage;

export type QuizRemoveResult =  {
    statusCode: number,
    message?: string
  };

export type Userdetails = ErrorMessage | {user: {
    userId: number,
    name: string,
    email: string,
    numSuccessfulLogins: number,
    numFailedPasswordsSinceLastLogin: number,
}}

export type QuizNameUpdateResult = EmptyObject | ErrorMessage;

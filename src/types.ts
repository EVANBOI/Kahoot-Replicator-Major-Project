export type EmptyObject = { };

export type ErrorMessage = { };

export type ClearResult = EmptyObject;

export type UserUpdateResult = EmptyObject | ErrorMessage;

export type QuizInfoResult = ErrorMessage | {
    quizId: string,
    name: string,
    timeCreated: number,
    timeLastEdited: number,
    description: string
}

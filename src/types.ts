import { SessionStatus } from "./session";

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
    description: string,
    questions: QuestionBody[],
    duration: number,
    thumbnailUrl?: string
}

export type Data = {
    users: User[],
    quizzes: Quiz[],
    trash: Quiz[]
}

export type QuestionIdObject = {
    questionId: number
}

// Types for function return

export type MessageObject = {
    message: {
      messageBody: string;
    };
};

export type EmptyObject = Record<string, never>;
export type ClearResult = EmptyObject;
export type UserUpdateResult = EmptyObject;
export type UserRegistrationResult = ErrorMessage | Token;

export type GetSessionStatus = ErrorMessage | {
    state: SessionStatus,
    atQuestion: number,
    players: string[],
    metadata: {
        quizId: number,
        name: string,
        timeCreated: number,
        timeLastEdited: number,
        description: string,
        numQuestions: number,
        questions: QuestionBody[],
        duration: number,
        thumbnailUrl: string
    }
}

export type QuizListDetails = ErrorMessage | {
    quizzes: {
        quizId: number
        name: string,
    }[]
}

export type QuizInfoResult = {
    quizId: number,
    name: string,
    timeCreated: number,
    timeLastEdited: number,
    description: string,
    questions: QuestionBody[]
    duration: number
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

export type QuestionBody = {
    questionId?: number,
    question: string,
    duration: number,
    points: number,
    answers: {
        answer: string,
        answerId?: number,
        colour?: string,
        correct: boolean
    }[]
    thumbnailUrl?: string
};

export type CreateQuestionReturn = QuestionIdObject | ErrorMessage;

export type TrashViewDetails = ErrorMessage | {
    quizzes: {
        quizId: number
        name: string,
    }[]
}

export type QuizTrashEmptyResult = EmptyObject;

export type QuizQuestionMoveResult = EmptyObject;

export type QuizSessionViewResult = {
    activeSessions: number[],
    inactiveSessions: number[]
}

export type QuizSessionResultLinkResult = {
    url: string
}

export type PlayerQuestionResultResult = {
    questionId: number,
    playersCorrectList : string[],
    averageAnswerTime: number,
    percentCorrect: number
}

export type PlayerStatusResult = {
    state: string, 
    numQuestions: number, 
    atQuestion: number, 
}

export type PlayerChatlogResult = {
	messages: [
		{
			messageBody: string, 
			playerId: number, 
			playerName: string, 
			timeSent: number
		}
	]
}

// other types
export type PositionWithTokenObj = {
    token: string,
    newPosition: number
}

export type PositionObj = {
    newPosition: number
}

export type QuizRestoreResult = {
    statusCode: number,
    message: string
  };

export type QuizQuestionDeleteResult = {
    statusCode: number,
    message: string
  };

	export type PlayerQuestionAnswerResult = {
    statusCode?: number;
    error?: string;
  }

  export type SessionResults = {
    usersRankedByScore: {
      name: string;
      score: number;
    }[];
    questionResults: {
      questionId: number;
      playersCorrectList: string[];
      averageAnswerTime: number;
      percentCorrect: number;
    }[];
  };

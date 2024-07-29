import express, { json, Request, Response } from 'express';
import { echo } from './newecho';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import process from 'process';
import {
  adminQuizCreate,
  adminQuizInfo,
  adminQuizList,
  adminQuizDescriptionUpdate,
  adminQuizRemove, adminQuizTrashEmpty,
  adminQuizRestore,
  adminQuizTrashView,
  adminQuizTransfer,
} from './quiz';
import {
  adminCreateQuizQuestion,
  adminQuizQuestionDelete,
  adminQuizQuestionMove,
  adminQuizQuestionDuplicate,
  adminQuizQuestionUpdate
} from './question';
import {
  adminAuthLogin,
  adminUserDetails,
  adminAuthRegister,
  adminUserDetailsUpdate,
  adminUserPasswordUpdate,
  adminAuthLogout
} from './auth';
import { clear } from './other';
import { getData } from './dataStore';
import {
  findUserBySessionId,
  tokenCheck,
  quizExistWithCorrectCreatorCheck,
  allExistInTrashCheck,
  quizExistCheck,
  quizIdCheck
} from './helpers';
import { adminQuizNameUpdate } from './quiz';
import { Unauthorised, BadRequest, Forbidden } from './error';
import { StatusCodes } from 'http-status-codes';
import { PositionWithTokenObj } from './types';
import {
  adminQuizSessionResultLink,
  adminQuizSessionResults,
  adminQuizSessionStart,
  adminQuizSessionStatus,
  adminQuizSessionUpdate,
  adminQuizSessionView,
  adminQuizThumbnailUpdate,
  playerChatlog,
  playerJoin,
  playerQuestionAnswer,
  playerQuestionInfo,
  playerQuestionResult,
  playerResults,
  playerSendMessage,
  playerStatus
} from './session';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));
// for producing the docs that define the API
const file = fs.readFileSync(path.join(process.cwd(), 'swagger.yaml'), 'utf8');
app.get('/', (req: Request, res: Response) => res.redirect('/docs'));
app.use('/docs', sui.serve, sui.setup(YAML.parse(file), { swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' } }));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || '127.0.0.1';

// ====================================================================
//  ================= WORK IS DONE BELOW THIS LINE ===================
// ====================================================================

// Example get request
app.get('/echo', (req: Request, res: Response) => {
  const result = echo(req.query.echo as string);
  if ('error' in result) {
    res.status(400);
  }
  return res.json(result);
});

app.delete('/v1/clear', (req: Request, res: Response) => {
  res.json(clear());
});

app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  try {
    res.json(adminAuthRegister(email, password, nameFirst, nameLast));
  } catch (e) {
    if (e instanceof BadRequest) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: e.message });
    }
  }
});

app.get('/v2/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  try {
    res.json(adminQuizList(token));
  } catch (e) {
    if (e instanceof Unauthorised) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ error: e.message });
    }
  }
});

app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.query.token as string;
  try {
    res.json(adminQuizList(token));
  } catch (e) {
    if (e instanceof Unauthorised) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ error: e.message });
    }
  }
});

app.put('/v1/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const { token, description } = req.body;
  const quizId = parseInt(req.params.quizid);
  try {
    res.json(adminQuizDescriptionUpdate(token, quizId, description));
  } catch (e) {
    if (e instanceof Unauthorised) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ error: e.message });
    } else if (e instanceof Forbidden) {
      return res.status(StatusCodes.FORBIDDEN).json({ error: e.message });
    } else if (e instanceof BadRequest) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: e.message });
    }
  }
});

app.put('/v2/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const { description } = req.body;
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid);
  try {
    res.json(adminQuizDescriptionUpdate(token, quizId, description));
  } catch (e) {
    if (e instanceof Unauthorised) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ error: e.message });
    } else if (e instanceof Forbidden) {
      return res.status(StatusCodes.FORBIDDEN).json({ error: e.message });
    } else if (e instanceof BadRequest) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: e.message });
    }
  }
});

app.delete('/v1/clear', (req: Request, res: Response) => {
  res.json(clear());
});

app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = adminAuthLogin(email, password);
  if ('error' in result) {
    return res.status(result.statusCode).json({ error: result.error });
  }
  res.json(result);
});

// This is the get admin userdetails method from the swagger
app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const result = adminUserDetails(token);
  if ('error' in result) {
    return res.status(result.statusCode).json({ error: result.error });
  }
  res.status(200).json(result);
});

app.get('/v2/admin/user/details', (req: Request, res: Response) => {
  const token = req.headers.token as string;

  try {
    const userDetails = adminUserDetails(token);
    res.json(userDetails);
  } catch (e) {
    if (e instanceof Unauthorised) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ error: e.message });
    }
  }
});

app.delete('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const id = parseInt(req.params.quizid);
  const result = adminQuizRemove(token, id);

  if (result.statusCode !== 200) {
    res.status(result.statusCode).json({ error: result.message });
  } else {
    res.status(200).json({});
  }
});

app.delete('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid);

  try {
    adminQuizRemove(token, quizId);
    res.status(StatusCodes.OK).json({});
  } catch (e) {
    if (e instanceof Unauthorised) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ error: e.message });
    } else if (e instanceof Forbidden) {
      return res.status(StatusCodes.FORBIDDEN).json({ error: e.message });
    } else if (e instanceof BadRequest) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: e.message });
    }
  }
});

app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  const { token, name, description } = req.body;
  const result = adminQuizCreate(token, name, description);
  const database = getData();
  const user = findUserBySessionId(database, token);
  if (!user && 'error' in result) {
    return res.status(result.statusCode).json({ error: result.error });
  } else if ('error' in result) {
    return res.status(result.statusCode).json({ error: result.error });
  }
  return res.status(200).json(result);
});

app.put('/v1/admin/user/details', (req: Request, res: Response) => {
  const { token, email, nameFirst, nameLast } = req.body;
  try {
    tokenCheck(token);
  } catch (error) {
    if (error instanceof Unauthorised) {
      return res.status(401).json({ error: error.message });
    }
  }

  try {
    res.json(adminUserDetailsUpdate(token, email, nameFirst, nameLast));
  } catch (error) {
    if (error instanceof BadRequest) {
      return res.status(400).json({ error: error.message });
    }
  }
});

app.get('/v1/admin/quiz/trash', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const result = adminQuizTrashView(token);
  if ('error' in result) {
    return res.status(result.statusCode).json({ error: result.error });
  }
  res.json(result);
});

app.get('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const quizId = parseInt(req.params.quizid);
  try {
    tokenCheck(token);
  } catch (error) {
    if (error instanceof Unauthorised) {
      return res.status(401).json({ error: error.message });
    }
  }
  try {
    res.json(adminQuizInfo(token, quizId));
  } catch (error) {
    if (error instanceof Forbidden) {
      return res.status(403).json({ error: error.message });
    }
  }
});

app.put('/v1/admin/user/password', (req: Request, res: Response) => {
  const { token, oldPassword, newPassword } = req.body;
  try {
    tokenCheck(token);
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
  try {
    adminUserPasswordUpdate(token, oldPassword, newPassword);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
  res.json({});
});

app.put('/v1/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const { token, quizId, name } = req.body;
  const result = adminQuizNameUpdate(token, quizId, name);
  if ('error' in result) {
    return res.status(result.statusCode).json({ error: result.error });
  }
  res.json(result);
});

app.post('/v1/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const { token, questionBody } = req.body;
  try {
    res.json(adminCreateQuizQuestion(quizId, token, questionBody));
  } catch (e) {
    if (e instanceof Unauthorised) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ error: e.message });
    } else if (e instanceof Forbidden) {
      return res.status(StatusCodes.FORBIDDEN).json({ error: e.message });
    } else if (e instanceof BadRequest) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: e.message });
    }
  }
});

app.post('/v2/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.headers.token as string;
  const { questionBody } = req.body;
  try {
    res.json(adminCreateQuizQuestion(quizId, token, questionBody, true));
  } catch (e) {
    if (e instanceof Unauthorised) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ error: e.message });
    } else if (e instanceof Forbidden) {
      return res.status(StatusCodes.FORBIDDEN).json({ error: e.message });
    } else if (e instanceof BadRequest) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: e.message });
    }
  }
});

app.put('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const { token, questionBody } = req.body;
  try {
    tokenCheck(token);
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
  try {
    quizIdCheck(token, quizId);
  } catch (error) {
    return res.status(403).json({ error: error.message });
  }
  try {
    res.json(adminQuizQuestionUpdate(quizId, questionId, questionBody, token));
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post('/v1/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const token = req.body.token as string;
  const id = parseInt(req.params.quizid);
  const result = adminQuizRestore(token, id);

  if (result.statusCode !== 200) {
    res.status(result.statusCode).json({ error: result.message });
  } else {
    res.status(200).json({});
  }
});

app.post('/v2/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid);

  try {
    res.json(adminQuizRestore(token, quizId));
  } catch (e) {
    if (e instanceof Unauthorised) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ error: e.message });
    } else if (e instanceof Forbidden) {
      return res.status(StatusCodes.FORBIDDEN).json({ error: e.message });
    } else if (e instanceof BadRequest) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: e.message });
    }
  }
});

app.delete('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const result = adminQuizQuestionDelete(token, quizId, questionId);

  if (result.statusCode !== 200) {
    res.status(result.statusCode).json({ error: result.message });
  } else {
    res.status(200).json({});
  }
});

app.delete('/v2/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);

  try {
    adminQuizQuestionDelete(token, quizId, questionId);
    res.status(StatusCodes.OK).json({});
  } catch (e) {
    if (e instanceof Unauthorised) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ error: e.message });
    } else if (e instanceof Forbidden) {
      return res.status(StatusCodes.FORBIDDEN).json({ error: e.message });
    } else if (e instanceof BadRequest) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: e.message });
    }
  }
});

app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  const { token } = req.body;
  try {
    tokenCheck(token);
  } catch (e) {
    if (e instanceof Unauthorised) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ error: e.message });
    }
  }
  res.json(adminAuthLogout(token));
});

app.post('/v2/admin/auth/logout', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  try {
    tokenCheck(token);
  } catch (e) {
    if (e instanceof Unauthorised) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ error: e.message });
    }
  }
  res.json(adminAuthLogout(token));
});

app.delete('/v1/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const quizIds = req.query.quizIds as string;
  try {
    tokenCheck(token);
  } catch (error) {
    if (error instanceof Unauthorised) {
      return res.status(401).json({ error: error.message });
    }
  }
  try {
    quizExistWithCorrectCreatorCheck(token, quizIds);
  } catch (error) {
    if (error instanceof Forbidden) {
      return res.status(403).json({ error: error.message });
    }
  }
  try {
    allExistInTrashCheck(quizIds);
  } catch (error) {
    if (error instanceof BadRequest) {
      return res.status(400).json({ error: error.message });
    }
  }

  res.json(adminQuizTrashEmpty(quizIds));
});

app.post('/v1/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const { token, userEmail } = req.body;
  const quizId = parseInt(req.params.quizid);
  try {
    tokenCheck(token);
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
  try {
    quizIdCheck(token, quizId);
  } catch (error) {
    return res.status(403).json({ error: error.message });
  }
  try {
    const result = adminQuizTransfer(token, quizId, userEmail);
    return res.json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post('/v1/admin/quiz/:quizid/question/:questionid/duplicate', (req: Request, res: Response) => {
  const { token } = req.body;
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const result = adminQuizQuestionDuplicate(token, quizId, questionId);
  if ('error' in result) {
    return res.status(result.statusCode).json({ error: result.error });
  }
  return res.status(200).json(result);
});

app.put('/v1/admin/quiz/:quizid/question/:questionid/move', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const moveInfo = req.body;
  try {
    tokenCheck(moveInfo.token);
  } catch (error) {
    if (error instanceof Unauthorised) {
      return res.status(401).json({ error: error.message });
    }
  }
  try {
    quizExistCheck(quizId, moveInfo.token);
  } catch (error) {
    if (error instanceof Forbidden) {
      return res.status(403).json({ error: error.message });
    }
  }
  try {
    res.json(adminQuizQuestionMove(quizId, questionId, moveInfo));
  } catch (error) {
    if (error instanceof BadRequest) {
      return res.status(400).json({ error: error.message });
    }
  }
});

// Evan's function don't change the order needs to be above
app.put('/v1/admin/quiz/:quizid/session/:sessionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const sessionId = parseInt(req.params.sessionid);
  const token = req.headers.token as string;
  const { action } = req.body;
  const result = adminQuizSessionUpdate(quizId, sessionId, token, action);
  return res.json(result);
});

app.get('/v1/admin/quiz/:quizid/session/:sessionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.query.quizid as string);
  const sessionId = parseInt(req.query.sessionid as string);
  const token = req.headers.token as string;
  const result = adminQuizSessionStatus(quizId, sessionId);
  return res.json(result);
});

app.get('/v1/player/:playerid/question/:questionposition', (req: Request, res: Response) => {
  const playerId = parseInt(req.query.playerid as string);
  const questionPosition = parseInt(req.query.questionposition as string);
  const result = playerQuestionInfo(playerId, questionPosition);
  return res.json(result);
});

app.post('/v1/player/:playerid/chat', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const { MessageObject } = req.body;
  const result = playerSendMessage(playerId, MessageObject);
  return res.json(result);
});

app.get('/v1/admin/quiz/:quizid/sessions', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid);
  const result = adminQuizSessionView(token, quizId);
  return res.json(result);
});

app.get('/v1/admin/quiz/:quizid/session/:sessionid/results/csv', (req: Request, res: Response) => {
  const quizId = parseInt(req.query.quizid as string);
  const sessionId = parseInt(req.query.sessionid as string);
  const token = req.headers.token as string;
  const result = adminQuizSessionResultLink(quizId, sessionId, token);
  return res.json(result);
});

app.get('/v1/player/:playerid/question/:questionposition/results', (req: Request, res: Response) => {
  const playerId = parseInt(req.query.playerid as string);
  const questionPosition = parseInt(req.query.questionposition as string);
  const result = playerQuestionResult(playerId, questionPosition);
  return res.json(result);
});
app.post('/v1/admin/quiz/{quizid}/session/start', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.headers.token as string;
  const { autoStartNum } = req.body;
  const result = adminQuizSessionStart(quizId, token, autoStartNum);
  return res.json(result);
});
app.post('/v1/player/join', (req: Request, res: Response) => {
  const { sessionId, name } = req.body;
  const result = playerJoin(sessionId, name);
  return res.json(result);
});
app.get('/v1/player/:playerid/results', (req: Request, res: Response) => {
  const playerId = parseInt(req.query.playerid as string);
  const result = playerResults(playerId);
  return res.json(result);
});

// Evan's function
app.get('/v1/player/:playerid', (req: Request, res: Response) => {
  const playerId = parseInt(req.query.playerid as string);
  const result = playerStatus(playerId);
  return res.json(result);
});

// Evan's function
app.get('/v1/player/:playerid/chat', (req: Request, res: Response) => {
  const playerId = parseInt(req.query.playerid as string);
  const result = playerChatlog(playerId);
  return res.json(result);
});

app.put('/v1/player/:playerid/question/:questionposition/answer', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const questionPosition = parseInt(req.params.questionposition);
  const { answerIds } = req.body;
  const result = playerQuestionAnswer(playerId, questionPosition, answerIds);
  return res.json(result);
});

app.put('/v1/admin/quiz/:quizid:/thumbnail', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const token = req.headers.token as string;
  const { imgUrl } = req.body;
  const result = adminQuizThumbnailUpdate(playerId, token, imgUrl);
  return res.json(result);
});

app.put('/v1/admin/quiz/:quizid/session/:sessionid/results', (req: Request, res: Response) => {
  const quizId = parseInt(req.query.quizid as string);
  const sessionId = parseInt(req.query.sessionid as string);
  const token = req.headers.token as string;
  const result = adminQuizSessionResults(quizId, sessionId, token);
  return res.json(result);
});

// v2 functions
app.put('/v2/admin/user/details', (req: Request, res: Response) => {
  const { email, nameFirst, nameLast } = req.body;
  const token = req.headers.token as string;
  try {
    tokenCheck(token);
  } catch (error) {
    if (error instanceof Unauthorised) {
      return res.status(401).json({ error: error.message });
    }
  }
  try {
    res.json(adminUserDetailsUpdate(token, email, nameFirst, nameLast));
  } catch (error) {
    if (error instanceof BadRequest) {
      return res.status(400).json({ error: error.message });
    }
  }
});

app.get('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid);
  try {
    tokenCheck(token);
  } catch (error) {
    if (error instanceof Unauthorised) {
      return res.status(401).json({ error: error.message });
    }
  }
  try {
    res.json(adminQuizInfo(token, quizId));
  } catch (error) {
    if (error instanceof Forbidden) {
      return res.status(403).json({ error: error.message });
    }
  }
});

app.delete('/v2/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizIds = req.query.quizIds as string;
  try {
    tokenCheck(token);
  } catch (error) {
    if (error instanceof Unauthorised) {
      return res.status(401).json({ error: error.message });
    }
  }
  try {
    quizExistWithCorrectCreatorCheck(token, quizIds);
  } catch (error) {
    if (error instanceof Forbidden) {
      return res.status(403).json({ error: error.message });
    }
  }
  try {
    allExistInTrashCheck(quizIds);
  } catch (error) {
    if (error instanceof BadRequest) {
      return res.status(400).json({ error: error.message });
    }
  }

  res.json(adminQuizTrashEmpty(quizIds));
});

app.put('/v2/admin/quiz/:quizid/question/:questionid/move', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const token = req.headers.token as string;
  const newPosition = req.body.newPosition;
  const moveInfo:PositionWithTokenObj = {
    token: token,
    newPosition: newPosition
  };
  try {
    tokenCheck(token);
  } catch (error) {
    if (error instanceof Unauthorised) {
      return res.status(401).json({ error: error.message });
    }
  }
  try {
    quizExistCheck(quizId, token);
  } catch (error) {
    if (error instanceof Forbidden) {
      return res.status(403).json({ error: error.message });
    }
  }
  try {
    res.json(adminQuizQuestionMove(quizId, questionId, moveInfo));
  } catch (error) {
    if (error instanceof BadRequest) {
      return res.status(400).json({ error: error.message });
    }
  }
});

// ====================================================================
//  ================= WORK IS DONE ABOVE THIS LINE ===================
// ====================================================================

app.use((req: Request, res: Response) => {
  const error = `
    Route not found - This could be because:
      0. You have defined routes below (not above) this middleware in server.ts
      1. You have not implemented the route ${req.method} ${req.path}
      2. There is a typo in either your test or server, e.g. /posts/list in one
         and, incorrectly, /post/list in the other
      3. You are using ts-node (instead of ts-node-dev) to start your server and
         have forgotten to manually restart to load the new changes
      4. You've forgotten a leading slash (/), e.g. you have posts/list instead
         of /posts/list in your server.ts or test file
  `;
  res.status(404).json({ error });
});

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => {
    console.log('Shutting down server gracefully.');
    process.exit();
  });
});

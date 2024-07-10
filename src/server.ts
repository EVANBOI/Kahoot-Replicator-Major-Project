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
import { adminQuizCreate, adminQuizInfo, adminQuizList, adminQuizDescriptionUpdate, adminQuizRemove } from './quiz';
import { adminAuthLogin, adminUserDetails, adminAuthRegister, adminUserDetailsUpdate, adminUserPasswordUpdate } from './auth';
import { clear } from './other';
import { getData } from './dataStore';
import { findUserBySessionId } from './helpers';
import { adminQuizNameUpdate } from './quiz';
import { error } from 'console';

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
  const result = adminAuthRegister(email, password, nameFirst, nameLast);
  if ('error' in result) {
    return res.status(result.statusCode).json({ error: result.error });
  }
  return res.json(result);
});

app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  const sessionId = req.query.sessionId as string;
  const result = adminQuizList(sessionId);
  if ('error' in result) {
    return res.status(result.statusCode).json({ error: result.error });
  }
  return res.json(result);
});

app.put('/v1/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const { sessionId, description } = req.body;
  const quizId = parseInt(req.params.quizid);
  const result = adminQuizDescriptionUpdate(sessionId, quizId, description);
  if ('error' in result) {
    return res.status(result.statusCode).json({ error: result.error })
  }
  return res.json(result);
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
  // console.log(token, 'HI')
  const result = adminUserDetails(token);
  if ('error' in result) {
    return res.status(result.statusCode).json({ error: result.error });
  }
  res.status(200).json(result);
});

// This is the get admin userdetails method from the swagger
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
  const { sessionId, email, nameFirst, nameLast } = req.body;
  const result = adminUserDetailsUpdate(sessionId, email, nameFirst, nameLast);
  if ('error' in result) {
    return res.status(result.statusCode).json({ error: result.error });
  }
  res.json(result);
});

app.get('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const sessionId = req.query.sessionId as string;
  const quizId = parseInt(req.params.quizid);
  const result = adminQuizInfo(sessionId, quizId);
  if ('error' in result) {
    return res.status(result.statusCode).json({ error: result.error });
  }
  res.json(result);
});

app.put('/v1/admin/user/password', (req: Request, res: Response) => {
  const { sessionId, oldPassword, newPassword } = req.body;
  const result = adminUserPasswordUpdate(sessionId, oldPassword, newPassword);
  if ('error' in result) {
    return res.status(result.statusCode).json({ error: result.error });
  }
  res.json(result);
});

app.put('/v1/admin/quiz/name', (req: Request, res: Response) => {
  const { sessionId, quizId, name } = req.body;
  const result = adminQuizNameUpdate(sessionId, quizId, name);
  if ('error' in result) {
    return res.status(result.statusCode).json({ error: result.error });
    }
   res.json(result);
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

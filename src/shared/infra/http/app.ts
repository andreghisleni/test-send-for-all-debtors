import 'reflect-metadata';

import { errors } from 'celebrate';
import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import 'express-async-errors';
import { createServer } from 'http';
import path from 'node:path';
import socketIo from 'socket.io';

import { uploadConfig } from '@config/upload';

import AppError from '@shared/errors/AppError';

import { rateLimiter } from './middlewares/rateLimiter';
import { routes } from './routes';

import '@shared/container';

const app = express();

const server = createServer(app);

const io = new socketIo.Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', socket => {
  console.log(socket.id);
  socket.send('test');

  socket.on('join_room', data => {
    socket.join(data.room);
    console.log(data.room);
  });
});

io.on('error', err => console.log(err));

app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.set('trust proxy', true);
(async () => {
  app.use((req: Request, _: Response, next: NextFunction) => {
    req.io = io;
    return next();
  });
})();
app.use('/files', express.static(uploadConfig.uploadsFolder));
app.use('/downloads', express.static(uploadConfig.downloadsFolder));
app.use('/public', express.static(path.resolve(__dirname, 'public')));
app.use(rateLimiter);
app.use(routes);

app.use(errors());

app.use((err: Error, req: Request, res: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    return res
      .status(err.statusCode)
      .json({ status: 'error', message: err.message });
  }
  console.error(err); // eslint-disable-line
  return res
    .status(500)
    .json({ status: 'error', message: 'Internal server error' });
});

export { server };

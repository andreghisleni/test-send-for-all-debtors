/* eslint-disable @typescript-eslint/naming-convention */

import socketIo from 'socket.io';

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
      };
      io: socketIo.Server;
    }
  }
}

import { NextFunction, Request, Response } from 'express';
import { verify, TokenExpiredError } from 'jsonwebtoken';

import auth from '@config/auth';

import AppError from '@shared/errors/AppError';

interface ITokenPayload {
  iat: number;
  exp: number;
  sub: string;
  refreshToken: boolean;
}

const ensureAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError('JWT token is missing - 1', 401);
  }
  const [, token] = authHeader.split(' ');
  try {
    console.log(auth.jwt);
    console.log(token);

    const decoded = verify(token, auth.jwt.secret);

    const { sub, refreshToken } = decoded as ITokenPayload;
    if (refreshToken) {
      throw new AppError('Invalid JWT token - 2', 401);
    }
    req.user = {
      id: sub,
    };

    return next();
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      console.log(err);
      throw new AppError('Expired_JWT_token', 401);
    } else {
      throw new AppError('Invalid JWT token - 3', 401);
    }
  }
};

export default ensureAuthenticated;

export { ensureAuthenticated };

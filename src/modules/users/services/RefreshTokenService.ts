import { getPermissions } from '@utils/getPermissions';
import { isAfter, isEqual } from 'date-fns';
import { sign, verify, TokenExpiredError } from 'jsonwebtoken';
import ms from 'ms';
import { injectable, inject } from 'tsyringe';

import auth from '@config/auth';

import { ICacheProvider } from '@shared/container/providers/CacheProvider/models/ICacheProvider';
import AppError from '@shared/errors/AppError';

import { IUsersRepository } from '../repositories/IUsersRepository';

interface IRequest {
  refreshToken: string;
}
interface IResponse {
  token: string;
  refreshToken: string;

  permissions: string[];
}

interface ITokenPayload {
  iat: number;
  exp: number;
  sub: string;
  refreshToken: boolean;
  passwordUpdated: number;
  expirete: number;
}

@injectable()
export class RefreshTokenService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('CacheProvider')
    private cacheProvider: ICacheProvider,
  ) { }// eslint-disable-line

  public async execute({ refreshToken }: IRequest): Promise<IResponse> {
    const { secret, expiresIn, expiresInRefresh } = auth.jwt;

    try {
      const decoded = verify(refreshToken, secret);

      const {
        sub,
        refreshToken: isRefreshToken,
        passwordUpdated,
        expirete,
      } = decoded as ITokenPayload;

      const user = await this.usersRepository.findById(sub);

      if (!user || !isRefreshToken) {
        throw new AppError('Invalid tokens.', 401);
      }

      if (isAfter(user.password_update_time, passwordUpdated)) {
        throw new AppError(
          'Expired refresh token (the password is updated).',
          401,
        );
      }

      let RToken = refreshToken;

      if (
        isAfter(Date.now() + ms('1d'), expirete) ||
        isEqual(Date.now() + ms('1d'), expirete)
      ) {
        RToken = sign(
          {
            passwordUpdated: new Date(user.password_update_time).getTime(),
            refreshToken: true,
            expirete: new Date(Date.now() + ms(expiresInRefresh)).getTime(),
          },
          secret,
          {
            subject: user.id,
            expiresIn: expiresInRefresh,
          },
        );
      }

      const token = sign({ refreshToken: false }, secret, {
        subject: user.id,
        expiresIn,
      });

      const permissions = getPermissions(user);

      const cacheKey = `permissions:${user.id}`;

      const cachedPermissions = await this.cacheProvider.recover<string[]>(
        cacheKey,
      );

      if (
        cachedPermissions &&
        !cachedPermissions.every((value, index) => value === permissions[index])
      ) {
        await this.cacheProvider.invalidate(cacheKey);
      }

      await this.cacheProvider.save(cacheKey, permissions);

      return { token, refreshToken: RToken, permissions };
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        throw new AppError('Expired_JWT_Refresh_token', 401);
      } else {
        throw new AppError((err as any).message, 401); //eslint-disable-line
      }
    }
  }
}

import { User } from '@prisma/client';
import { getPermissions } from '@utils/getPermissions';
import { lookup } from 'geoip-lite';
import { sign } from 'jsonwebtoken';
import ms from 'ms';
import { injectable, inject } from 'tsyringe';

import auth from '@config/auth';

import { ICacheProvider } from '@shared/container/providers/CacheProvider/models/ICacheProvider';
import AppError from '@shared/errors/AppError';

import { IHashProvider } from '../providers/HashProvider/models/IHashProvider';
import { IUserIpsRepository } from '../repositories/IUserIpsRepository';
import { IUsersRepository } from '../repositories/IUsersRepository';

interface IRequest {
  email: string;
  password: string;
  ip: string;
}

interface IResponse {
  user: User;
  token: string;
  refreshToken: string;
}
@injectable()
export class AuthenticateUserService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('UserIpsRepository')
    private userIpsRepository: IUserIpsRepository,

    @inject('HashProvider')
    private hashProvider: IHashProvider,

    @inject('CacheProvider')
    private cacheProvider: ICacheProvider,
  ) { }// eslint-disable-line

  public async execute({ email, password, ip }: IRequest): Promise<IResponse> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Incorrect user/password combination.', 401);
    }

    if (ip.startsWith('::ffff:')) {
      await this.userIpsRepository.create({
        user_id: user.id,
        ip,
        local: 'Rede local',
      });
    } else {
      const ipData = lookup(ip);

      await this.userIpsRepository.create({
        user_id: user.id,
        ip,
        local: ipData
          ? `${ipData.city} | ${ipData.region} | ${ipData.country}`
          : 'local ip',
      });
    }
    const passwordMatched = await this.hashProvider.compareHash(
      password,
      user.password_hash,
    );

    if (!passwordMatched) {
      throw new AppError('Incorrect user/password combination.', 401);
    }
    const { secret, expiresIn, expiresInRefresh } = auth.jwt;
    const token = sign({ refreshToken: false }, secret, {
      subject: user.id,
      expiresIn,
    });
    const refreshToken = sign(
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

    return { user, token, refreshToken };
  }
}

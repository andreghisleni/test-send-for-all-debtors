import { User, UserToken } from '@prisma/client';

export interface IUserTokensRepository {
  generate(user: User): Promise<UserToken>;
  findByToken(token: string): Promise<UserToken | undefined>;
  delete(id: string): Promise<void>;
  findByUserId(id: string): Promise<UserToken | undefined>;
}

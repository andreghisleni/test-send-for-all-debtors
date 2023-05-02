import { env } from '@env';
import { RedisOptions } from 'ioredis';

export const redisConfig = {
  host: env.REDIS_HOST,
  port: Number(env.REDIS_PORT),
  password: env.REDIS_PASS || undefined,
} as RedisOptions;

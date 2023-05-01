import { env } from '@env';
import { RedisOptions } from 'ioredis';

interface ICacheConfig {
  driver: 'redis';

  config: {
    redis: RedisOptions;
  };
}

export const cacheConfig: ICacheConfig = {
  driver: 'redis',
  config: {
    redis: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASS,
    },
  },
};

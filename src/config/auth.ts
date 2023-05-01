import { env } from '@env';

export default {
  jwt: {
    secret: env.APP_SECRET,
    expiresIn: '10m',
    expiresInRefresh: '7d',
  },
};

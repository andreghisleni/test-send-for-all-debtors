import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'production', 'test']).default('dev'),
  MODE: z.enum(['dev', 'production', 'test']).default('dev'),
  PORT: z.coerce.number().default(3333),
  PORT_BULL: z.coerce.number().default(3334),

  APP_NAME: z.string(),
  APP_SECRET: z.string().default('default'),
  APP_WEB_URL: z.string(),
  APP_API_URL: z.string(),

  DATABASE_URL: z.string(),

  MAIL_DRIVER: z.enum(['ethereal', 'ses']).default('ethereal'),

  MAIL_USER: z.string(),
  MAIL_PASS: z.string(),
  MAIL_HOST: z.string(),

  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),

  STORAGE_DRIVER: z.enum(['s3', 'disk']).default('disk'),

  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),
  REDIS_PASS: z.string().optional(),

  GOOGLE_MAPS_API_KEY: z.string(),

  WKHTMLTOPDF_URL: z.string(),

  CHROME_PATH: z.string().optional(),
});

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
  console.error('❌ Invalid environment variables', _env.error.format()); // eslint-disable-line no-console

  throw new Error('❌ Invalid environment variables');
}

export const env = _env.data;

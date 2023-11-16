import { Router } from 'express';
import redis from 'redis';

import { redisConfig } from '@config/redis';

import { routesClients } from '@modules/clientes/infra/http/routes';
import { routesVendas } from '@modules/vendas/infra/http/routes';

const routes = Router();

routes.use('/vendas', routesVendas);
routes.use('/clients', routesClients);

const redisClient = redis.createClient({
  host: redisConfig.host,
  port: redisConfig.port,
  password: redisConfig.password,
});

routes.get('/clear-redis', async (req, res) => {
  return res.json({ ok: redisClient.flushall() });
});

export { routes };

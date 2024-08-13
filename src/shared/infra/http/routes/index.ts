import { Router } from 'express';
import redis from 'redis';

import { redisConfig } from '@config/redis';

import { prisma } from '@shared/infra/prisma';

import { routesClients } from '@modules/clientes/infra/http/routes';
import { routesTest } from '@modules/teste/infra/http/routes';
import { routesVendas } from '@modules/vendas/infra/http/routes';

const routes = Router();

routes.use('/vendas', routesVendas);
routes.use('/clients', routesClients);
routes.use('/postite', routesTest);

const redisClient = redis.createClient({
  host: redisConfig.host,
  port: redisConfig.port,
  password: redisConfig.password,
});

routes.get('/clear-redis', async (req, res) => {
  return res.json({ ok: redisClient.flushall() });
});

routes.get('/get/all/clients', async (req, res) => {
  const clients = await prisma.clientes.findMany({
    include: {
      Origem: true,
    },
  });
  return res.json({ clients });
});

export { routes };

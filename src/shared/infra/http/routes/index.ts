import bwipjs from 'bwip-js';
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

routes.get('/barcode', async (req, res) => {
  bwipjs.toBuffer(
    {
      bcid: 'ean-13', // Tipo de código de barras
      text: 'teste1234', // Texto a ser codificado
      scale: 3, // Escala do código de barras
      height: 10, // Altura do código de barras
      includetext: true, // Incluir o texto no código de barras
      textxalign: 'center', // Alinhamento do texto
    },
    function (err, png) {
      if (err) {
        // Lidar com o erro
        res.status(500).send('Erro ao gerar o código de barras');
      } else {
        // Definir o cabeçalho da resposta como 'image/png'
        res.setHeader('Content-Type', 'image/png');
        // Enviar a imagem PNG na resposta
        res.send(png);
      }
    },
  );

  // res.send('ok');
});

export { routes };

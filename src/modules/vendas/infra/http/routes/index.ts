import { celebrate, Joi, Segments } from 'celebrate';
import { Router } from 'express';

import { GetDataFromCacheController } from '../controllers/GetDataFromCacheController';
import { devedoresRoutes } from './devedores.routes';
import { vendasRoutes } from './vendas.routes';

const routesVendas = Router();
const getDataFromCacheController = new GetDataFromCacheController();

routesVendas.use('/devedores', devedoresRoutes);
routesVendas.use(vendasRoutes);

routesVendas.get(
  '/data/:prefix',
  celebrate({
    [Segments.PARAMS]: {
      prefix: Joi.string().required(),
    },
  }),
  getDataFromCacheController.index,
);

export { routesVendas };

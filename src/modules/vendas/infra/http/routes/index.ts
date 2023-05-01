import { Router } from 'express';

import { devedoresRoutes } from './devedores.routes';
import { vendasRoutes } from './vendas.routes';

const routesVendas = Router();

routesVendas.use('/devedores', devedoresRoutes);
routesVendas.use(vendasRoutes);

export { routesVendas };

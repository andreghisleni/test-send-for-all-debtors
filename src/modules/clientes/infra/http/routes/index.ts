import { Router } from 'express';

import { clientsRoutes } from './clients.routes';

const routesClients = Router();

routesClients.use(clientsRoutes);

export { routesClients };

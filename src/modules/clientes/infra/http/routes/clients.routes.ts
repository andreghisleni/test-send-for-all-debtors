import { Router } from 'express';

import { ExportClientsController } from '../controllers/ExportClientsController';

const clientsRoutes = Router();
const exportClientsController = new ExportClientsController();

clientsRoutes.get('/export/excel', exportClientsController.index);

export { clientsRoutes };

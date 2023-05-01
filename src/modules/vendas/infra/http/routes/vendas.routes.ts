import { Router } from 'express';

import { ExportExtractController } from '../controllers/ExportExtractController';

const vendasRoutes = Router();
const exportExtractController = new ExportExtractController();

vendasRoutes.get('/extract/:id_venda', exportExtractController.show);
vendasRoutes.get('/extract/:id_venda/:type', exportExtractController.show);

export { vendasRoutes };

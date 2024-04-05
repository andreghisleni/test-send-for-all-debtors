import { Router } from 'express';

import { ExportExtractController } from '../controllers/ExportExtractController';
import { ExportVendasController } from '../controllers/ExportVendasController';

const vendasRoutes = Router();
const exportExtractController = new ExportExtractController();
const exportVendasController = new ExportVendasController();

vendasRoutes.get('/extract/:id_venda', exportExtractController.show);
vendasRoutes.get('/extract/:id_venda/:type', exportExtractController.show);
vendasRoutes.get('/excel', exportVendasController.index);

export { vendasRoutes };

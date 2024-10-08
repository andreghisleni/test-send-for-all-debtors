import { Router } from 'express';

import { ExportDevedoresController } from '../controllers/ExportDevedoresController';
import { ExportExtractDevedoresController } from '../controllers/ExportExtractDevedoresController';

const devedoresRoutes = Router();
const exportDevedoresController = new ExportDevedoresController();
const exportExtractDevedoresController = new ExportExtractDevedoresController();

devedoresRoutes.get('/export/excel', exportDevedoresController.index);
devedoresRoutes.get('/export/all/:email', exportExtractDevedoresController.index);
devedoresRoutes.get('/export/all2/:email', exportExtractDevedoresController.index1);

export { devedoresRoutes };

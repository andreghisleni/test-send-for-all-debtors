import { Router } from 'express';

import { ExportDevedoresController } from '../controllers/ExportDevedoresController';

const devedoresRoutes = Router();
const exportDevedoresController = new ExportDevedoresController();

devedoresRoutes.get('/export/excel', exportDevedoresController.index);

export { devedoresRoutes };

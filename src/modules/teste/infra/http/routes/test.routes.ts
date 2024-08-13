import { Router } from 'express';

import { ExportTestController } from '../controllers/ExportTesteController';

const testRoutes = Router();
const exportTestController = new ExportTestController();

testRoutes.get('/export/:number/pdf', exportTestController.index);
testRoutes.get('/export/html', exportTestController.index2);

export { testRoutes };

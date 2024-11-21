import { Router } from 'express';

import { GenerateProductPostiteController } from '../controllers/GenerateProductPostiteController';

const productRoutes = Router();
const generateProductPostiteController = new GenerateProductPostiteController();

productRoutes.get('/:id/postite/:type', generateProductPostiteController.index);
productRoutes.get('/:id/postite', generateProductPostiteController.index);

export { productRoutes };

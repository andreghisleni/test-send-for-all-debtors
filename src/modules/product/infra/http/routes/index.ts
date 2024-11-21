import { Router } from 'express';

import { productRoutes } from './product.routes';

const routesProduct = Router();

routesProduct.use(productRoutes);

export { routesProduct };

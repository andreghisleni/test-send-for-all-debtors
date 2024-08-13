import { Router } from 'express';

import { testRoutes } from './test.routes';

const routesTest = Router();

routesTest.use(testRoutes);

export { routesTest };

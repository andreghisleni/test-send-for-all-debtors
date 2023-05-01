import { Router } from 'express';

import { userAddressRouter } from './address.routes';
import { emailRouter } from './email.routes';
import { passwordRouter } from './password.routes';
import { permissionsRoutes } from './permissions.routes';
import { profileRouter } from './profile.routes';
import { sessionsRouter } from './sessions.routes';
import { usersRoutes } from './users.routes';

const routesUsers = Router();

routesUsers.use('/users', usersRoutes);
routesUsers.use('/user/permissions', permissionsRoutes);
routesUsers.use('/sessions', sessionsRouter);
routesUsers.use('/password', passwordRouter);
routesUsers.use('/profile', profileRouter);
routesUsers.use('/email', emailRouter);
routesUsers.use('/user/address', userAddressRouter);

export default routesUsers;

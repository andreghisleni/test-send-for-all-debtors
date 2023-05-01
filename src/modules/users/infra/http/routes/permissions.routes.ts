import { celebrate, Joi, Segments } from 'celebrate';
import { Router } from 'express';

import { UserPermissionGroupController } from '../controllers/UserPermissionGroupController';
import { UserPermissionsController } from '../controllers/UserPermissionsController';
import ensureAuthenticated from '../middlewares/ensureAuthenticated';
import { ensureReleased } from '../middlewares/ensureReleased';

const permissionsRoutes = Router();
const userPermissionsController = new UserPermissionsController();
const userPermissionGroupController = new UserPermissionGroupController();

permissionsRoutes.get(
  '/',
  ensureAuthenticated,
  ensureReleased('user-show-permissions'),
  userPermissionsController.show,
);

permissionsRoutes.post(
  '/link-group/:id',
  ensureAuthenticated,
  // ensureReleased('user-link-group'),
  celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().uuid().required(),
    },
    [Segments.BODY]: {
      permission_group_id: Joi.string().uuid().required(),
    },
  }),
  userPermissionGroupController.create,
);

export { permissionsRoutes };

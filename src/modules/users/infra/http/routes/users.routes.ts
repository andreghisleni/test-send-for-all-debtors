import { celebrate, Segments, Joi } from 'celebrate';
import { Router } from 'express';
import multer from 'multer';

import { uploadConfig } from '@config/upload';

import { UserAvatarController } from '../controllers/UserAvatarController';
import { UsersController } from '../controllers/UsersController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { ensureReleased } from '../middlewares/ensureReleased';

const usersRoutes = Router();
const usersController = new UsersController();
const userAvatarController = new UserAvatarController();
const upload = multer(uploadConfig.multer);

usersRoutes.post(
  '/',
  celebrate({
    [Segments.BODY]: {
      name: Joi.string().required(),
      document: Joi.string().required(),
      fantasy_name: Joi.string(),
      email: Joi.string().email().required(),
      phone: Joi.string().required(),
      password: Joi.string().required(),
      password_confirmation: Joi.string().required().valid(Joi.ref('password')),
      type: Joi.string().required().valid('producer', 'trader'),
      address: Joi.object({
        street: Joi.string().required(),
        number: Joi.string().required(),
        complement: Joi.string(),
        district: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        country: Joi.string().required(),
        zip_code: Joi.string().required(),
      }).required(),
    },
  }),
  usersController.create,
);

usersRoutes.patch(
  '/avatar',
  ensureAuthenticated,
  ensureReleased('user-update-avatar'),
  upload.single('avatar'),
  userAvatarController.update,
);

usersRoutes.get(
  '/',
  ensureAuthenticated,
  ensureReleased('users-list'),
  usersController.index,
);

export { usersRoutes };

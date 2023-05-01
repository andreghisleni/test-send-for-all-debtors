import { celebrate, Segments, Joi } from 'celebrate';
import { Router } from 'express';

import UserAddressController from '../controllers/UserAddressController';
import ensureAuthenticated from '../middlewares/ensureAuthenticated';
import { ensureReleased } from '../middlewares/ensureReleased';

const userAddressRouter = Router();
const userAddressController = new UserAddressController();

userAddressRouter.put(
  '/',
  ensureAuthenticated,
  ensureReleased('user-address-update'),
  celebrate({
    [Segments.BODY]: {
      street: Joi.string().required(),
      number: Joi.string().required(),
      complement: Joi.string().allow(null, ''),
      district: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      country: Joi.string().required(),
      zip_code: Joi.string().required(),
    },
  }),
  userAddressController.update,
);

export { userAddressRouter };

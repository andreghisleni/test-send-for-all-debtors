import { celebrate, Segments, Joi } from 'celebrate';
import { Router } from 'express';

import { EmailValidateController } from '../controllers/EmailValidateController';
import ensureAuthenticated from '../middlewares/ensureAuthenticated';

const emailRouter = Router();
const emailValidateController = new EmailValidateController();

emailRouter.post(
  '/re-send-validate',
  ensureAuthenticated,

  emailValidateController.create,
);

emailRouter.patch(
  '/validate',
  celebrate({
    [Segments.BODY]: {
      token: Joi.string().uuid().required(),
    },
  }),
  emailValidateController.update,
);
export { emailRouter };

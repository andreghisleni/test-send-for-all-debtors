import { celebrate, Segments, Joi } from 'celebrate';
import { Router } from 'express';

import { ProfileController } from '../controllers/ProfileController';
import ensureAuthenticated from '../middlewares/ensureAuthenticated';
import { ensureReleased } from '../middlewares/ensureReleased';

const profileRouter = Router();
const profileController = new ProfileController();

profileRouter.use(ensureAuthenticated);

profileRouter.get(
  '/',
  ensureReleased('user-list-profile'),
  profileController.show,
);

profileRouter.put(
  '/',
  ensureReleased('user-update-profile'),
  celebrate({
    [Segments.BODY]: {
      name: Joi.string().required(),
      fantasy_name: Joi.string(),
      phone: Joi.string().required(),
      old_password: Joi.string().empty(''),
      password: [Joi.string(), Joi.allow(null)],
      password_confirmation: Joi.string().valid(Joi.ref('password')),
    },
  }),
  profileController.update,
);

export { profileRouter };

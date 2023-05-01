import { userTransform } from '@utils/transform';
import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { ShowProfileService } from '@modules/users/services/ShowProfileService';
import { UpdateProfileService } from '@modules/users/services/UpdateProfileService';

export class ProfileController {
  public async show(req: Request, res: Response): Promise<Response> {
    const showProfile = container.resolve(ShowProfileService);
    const user = await showProfile.execute({
      user_id: req.user.id,
    });

    return res.json(userTransform(user));
  }

  public async update(req: Request, res: Response): Promise<Response> {
    const { name, fantasy_name, phone, old_password, password } = req.body;

    const updateProfile = container.resolve(UpdateProfileService);
    const user = await updateProfile.execute({
      user_id: req.user.id,
      name,
      fantasy_name,
      phone,
      password,
      old_password,
    });

    return res.json(userTransform(user));
  }
}

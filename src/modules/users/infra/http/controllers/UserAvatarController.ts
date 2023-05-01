import { userTransform } from '@utils/transform';
import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { UpdateUserAvatarService } from '@modules/users/services/UpdateUserAvatarService';

export class UserAvatarController {
  async update(req: Request, res: Response): Promise<Response> {
    const updateUserAvatar = container.resolve(UpdateUserAvatarService);

    const user = await updateUserAvatar.execute({
      user_id: req.user.id,
      avatarFileName: req.file?.filename || ``,
    });

    return res.json(userTransform(user));
  }
}

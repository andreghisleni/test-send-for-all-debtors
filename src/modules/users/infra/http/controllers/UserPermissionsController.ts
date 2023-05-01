import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { FindUserPermissionsService } from '@modules/users/services/FindUserPermissionsService';

export class UserPermissionsController {
  async show(req: Request, res: Response): Promise<Response> {
    const { id } = req.user;

    const findUserPermissions = container.resolve(FindUserPermissionsService);
    const user = await findUserPermissions.execute({
      user_id: id,
    });

    return res.json(user.permissions);
  }
}

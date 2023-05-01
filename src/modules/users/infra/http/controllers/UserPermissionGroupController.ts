import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { LinkUserToPermissionGroupService } from '@modules/users/services/LinkUserToPermissionGroupService';

export class UserPermissionGroupController {
  async create(req: Request, res: Response): Promise<Response> {
    const { permission_group_id } = req.body;
    const { id: user_id } = req.params;

    const linkUserToPermissionGroup = container.resolve(
      LinkUserToPermissionGroupService,
    );
    await linkUserToPermissionGroup.execute({
      user_id,
      permission_group_id,
    });

    return res.status(201).json();
  }
}

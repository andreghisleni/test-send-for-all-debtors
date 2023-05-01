import { NextFunction, Request, Response } from 'express';
import { container } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import { FindUserPermissionsService } from '@modules/users/services/FindUserPermissionsService';

export const ensureReleased = (permission_name: string) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { id } = req.user;

    if (!id) {
      throw new AppError('Not authorized', 401);
    }

    const findUserPermissions = container.resolve(FindUserPermissionsService);
    const { permissions } = await findUserPermissions.execute({
      user_id: id,
    });

    if (!permissions.includes(permission_name)) {
      throw new AppError('Not authorized', 401);
    }
    next();
  };
};

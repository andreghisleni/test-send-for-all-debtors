import { userTransform } from '@utils/transform';
import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { CreateUserService } from '@modules/users/services/CreateUserService';

import { FindAllUsersService } from '../../../services/FindAllUsersService';

export class UsersController {
  async create(req: Request, res: Response): Promise<Response> {
    const {
      name,
      document,
      fantasy_name,
      phone,
      email,
      password,
      type,
      address: {
        street,
        number,
        complement,
        district,
        city,
        state,
        country,
        zip_code,
      },
    } = req.body;

    const createUser = container.resolve(CreateUserService);
    const user = await createUser.execute({
      name,
      phone,
      email,
      password,
      document,
      fantasy_name: fantasy_name || name,
      type,
      address: {
        street,
        number,
        complement,
        district,
        city,
        state,
        country,
        zip_code,
      },
    });

    return res.json(userTransform(user));
  }

  async index(req: Request, res: Response): Promise<Response> {
    const findAllUsers = container.resolve(FindAllUsersService);

    const users = await findAllUsers.execute();

    return res.json(userTransform(users));
  }
}

import { userTransform } from '@utils/transform';
import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { UpdateUserAddressService } from '@modules/users/services/UpdateUserAddressService';

export default class UserAddressController {
  async update(req: Request, res: Response): Promise<Response> {
    const updateUserAddress = container.resolve(UpdateUserAddressService);

    const {
      street,
      number,
      complement,
      district,
      city,
      state,
      country,
      zip_code,
    } = req.body;

    const userAddress = await updateUserAddress.execute({
      user_id: req.user.id,

      street,
      number,
      complement,
      district,
      city,
      state,
      country,
      zip_code,
    });

    return res.json(userTransform(userAddress.user));
  }
}

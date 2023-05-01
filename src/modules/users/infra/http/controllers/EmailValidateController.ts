import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { ReSendValidateEmailService } from '@modules/users/services/ReSendValidateEmailService';
import { ValidateEmailService } from '@modules/users/services/ValidateEmailService';

export class EmailValidateController {
  public async create(req: Request, res: Response): Promise<Response> {
    const { id } = req.user;

    const reSendValidateEmail = container.resolve(ReSendValidateEmailService);
    await reSendValidateEmail.execute({
      id,
    });

    return res.status(204).json();
  }

  public async update(req: Request, res: Response): Promise<Response> {
    const { token } = req.body;

    const validateEmail = container.resolve(ValidateEmailService);
    await validateEmail.execute({
      token,
    });

    return res.status(204).json();
  }
}

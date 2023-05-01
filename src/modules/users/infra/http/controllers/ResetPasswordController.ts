import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { ResetPasswordService } from '@modules/users/services/ResetPasswordService';

export class ResetPasswordController {
  async update(req: Request, res: Response): Promise<Response> {
    const { token, password } = req.body;

    const resetPassword = container.resolve(ResetPasswordService);

    await resetPassword.execute({ token, password });

    return res.status(204).json();
  }
}

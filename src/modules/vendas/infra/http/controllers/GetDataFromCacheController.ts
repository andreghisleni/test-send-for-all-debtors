import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { GetDataFromRedisService } from '../../../services/GetDataFromRedisService';

export class GetDataFromCacheController {
  async index(req: Request, res: Response): Promise<void> {
    const { prefix } = req.params;

    const getDataFromRedis = container.resolve(GetDataFromRedisService);

    const { devedores } = await getDataFromRedis.execute({
      prefix,
    });

    res.json(devedores);
  }
}

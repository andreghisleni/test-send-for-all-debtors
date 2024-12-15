import { Request, Response } from 'express';
import fs from 'fs/promises';
import { container } from 'tsyringe';

import { ExportDevedoresToExelService } from '@modules/vendas/services/ExportDevedoresToExelService';

export class ExportDevedoresController {
  async index(req: Request, res: Response): Promise<void> {
    const exportDevedoresToExel = container.resolve(ExportDevedoresToExelService);

    const file = await exportDevedoresToExel.execute();

    res.download(file.file, file.fileName, async () => {
      await fs.unlink(file.file);
    });
  }
}

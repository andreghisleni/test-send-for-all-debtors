import { Request, Response } from 'express';
import fs from 'node:fs/promises';
import { container } from 'tsyringe';

import { ExportExtractAllToToPdfService } from '@modules/vendas/services/ExportExtractAllToToPdfService';

export class ExportExtractDevedoresController {
  async index(req: Request, res: Response): Promise<void> {
    const exportExtractAllToToPdf = container.resolve(
      ExportExtractAllToToPdfService,
    );

    const { file } = await exportExtractAllToToPdf.execute();

    res.download(file, async () => {
      await fs.unlink(file);
    });
  }
}

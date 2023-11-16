import { Request, Response } from 'express';
import fs from 'fs/promises';
import { container } from 'tsyringe';

import { ExportClientsToExcelService } from '@modules/clientes/services/ExportClientsToExcelService';

export class ExportClientsController {
  async index(req: Request, res: Response): Promise<void> {
    const exportClientsToExcel = container.resolve(ExportClientsToExcelService);

    const file = await exportClientsToExcel.execute();

    res.download(file.file, file.fileName, async () => {
      await fs.unlink(file.file);
    });
  }
}

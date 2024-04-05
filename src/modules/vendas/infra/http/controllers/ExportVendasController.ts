import { Request, Response } from 'express';
import fs from 'fs/promises';
import { container } from 'tsyringe';

import { ExportVendasToExcelService } from '@modules/vendas/services/ExportVendasToExcelService';

export class ExportVendasController {
  async index(req: Request, res: Response): Promise<void> {
    const exportVendasToExcel = container.resolve(ExportVendasToExcelService);

    const file = await exportVendasToExcel.execute();

    res.download(file.file, file.fileName, async () => {
      await fs.unlink(file.file);
    });
  }
}

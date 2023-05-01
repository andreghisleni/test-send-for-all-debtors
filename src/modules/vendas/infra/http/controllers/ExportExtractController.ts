import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { ExportExtractToToPdfService } from '@modules/vendas/services/ExportExtractToToPdfService';

export class ExportExtractController {
  async show(req: Request, res: Response): Promise<void> {
    const { id_venda } = req.params;

    const exportDevedoresToExel = container.resolve(
      ExportExtractToToPdfService,
    );

    const html = await exportDevedoresToExel.execute({
      id_venda: Number(id_venda),
    });

    res.send(html.html);
  }
}

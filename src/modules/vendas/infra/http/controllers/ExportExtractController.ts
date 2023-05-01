import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { ExportExtractToToPdfService } from '@modules/vendas/services/ExportExtractToToPdfService';

export class ExportExtractController {
  async show(req: Request, res: Response): Promise<void> {
    const { id_venda, type } = req.params;

    const exportDevedoresToExel = container.resolve(
      ExportExtractToToPdfService,
    );

    const { pdf, html } = await exportDevedoresToExel.execute({
      id_venda: Number(id_venda),
      type: type === 'pdf' ? 'pdf' : 'html',
    });

    if (type === 'pdf') {
      res.contentType('application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename=xyz.pdf');
      res.send(pdf);
    } else {
      res.send(html);
    }
  }
}

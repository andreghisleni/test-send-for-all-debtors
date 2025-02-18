import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { z } from 'zod';

import { ExportExtractToToPdfService } from '@modules/vendas/services/ExportExtractToToPdfService';

export class ExportExtractController {
  async show(req: Request, res: Response): Promise<void> {
    const { id_venda, type } = req.params;

    return res.redirect(`https://financeiro.marconnumis.com.br/sale/${id_venda}`);

    const exportDevedoresToExel = container.resolve(ExportExtractToToPdfService);

    const typeSchema = z.enum(['pdf', 'html', 'json']).default('html');

    const typeParsed = typeSchema.parse(type);

    const { pdf, html, json } = await exportDevedoresToExel.execute({
      id_venda: Number(id_venda),
      type: typeParsed,
    });

    // if (typeParsed === 'pdf') {
    //   res.contentType('application/pdf');
    //   res.setHeader('Content-Disposition', 'inline; filename=xyz.pdf');
    //   res.send(pdf);
    // } else {
    //   res.send(html);
    // }

    switch (typeParsed) {
      case 'pdf':
        res.contentType('application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename=xyz.pdf');
        res.send(pdf);
        break;
      case 'html':
        res.send(html);
        break;
      case 'json':
        res.json(json);
        break;

      default:
        res.send(html);
        break;
    }
  }
}

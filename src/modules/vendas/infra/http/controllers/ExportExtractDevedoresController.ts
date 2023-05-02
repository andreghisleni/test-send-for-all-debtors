import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { ExportExtractAllToToPdfService2 } from '@modules/vendas/services/ExportExtractAllToToPdfService2';

export class ExportExtractDevedoresController {
  async index(req: Request, res: Response): Promise<void> {
    const { email } = req.params;

    const exportExtractAllToToPdf = container.resolve(
      ExportExtractAllToToPdfService2,
    );

    await exportExtractAllToToPdf.execute({
      email,
    });

    res.send(`<h1>
      O arquivo está sendo gerado, aguarde alguns instantes e verifique o email: ${email}
      Que o arquivo será enviado.
    </h1>`);
  }
}

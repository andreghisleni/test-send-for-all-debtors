import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { ExportExtractAllToToPdfService2 } from '@modules/vendas/services/ExportExtractAllToToPdfService3';
import { SendMailTestService } from '@modules/vendas/services/SendMailTestService';

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
  async index1(req: Request, res: Response): Promise<void> {
    const { email } = req.params;

    const exportExtractAllToToPdf = container.resolve(SendMailTestService);

    await exportExtractAllToToPdf.execute({
      email,
    });

    res.send(`<h1>
      O arquivo está sendo gerado, aguarde alguns instantes e verifique o email: ${email}
      Que o arquivo será enviado.
    </h1>`);
  }
}

import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { z } from 'zod';

import { GenerateProductPostiteService } from '@modules/product/services/GenerateProductPostiteService';

export class GenerateProductPostiteController {
  async index(req: Request, res: Response): Promise<void> {
    const generateProductPostite = container.resolve(GenerateProductPostiteService);

    const type = z.enum(['pdf', 'html']).default('html').parse(req.params.type);

    const file = await generateProductPostite.execute({
      id: Number(req.params.id),
      type,
    });

    // res.download(file.file, file.fileName, async () => {
    //   await fs.unlink(file.file);
    // });

    if (type === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      // res.setHeader('Content-Disposition', `attachment;`);
      res.send(file.pdf);
    }

    if (type === 'html') {
      res.setHeader('Content-Type', 'text/html');
      res.send(file.html);
    }
  }
}

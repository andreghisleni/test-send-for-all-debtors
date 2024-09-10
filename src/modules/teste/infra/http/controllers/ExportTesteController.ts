import { Request, Response } from 'express';
import fs from 'fs/promises';
import { container } from 'tsyringe';

import { ExportTestHtmlService } from '@modules/teste/services/ExportTestHtmlService';
import { ExportTestPdfService } from '@modules/teste/services/ExportTestPdfService';

export class ExportTestController {
  async index(req: Request, res: Response): Promise<void> {
    const exportTestPdf = container.resolve(ExportTestPdfService);

    const page = req.query.page ? Number(req.query.page) : 1;

    const file = await exportTestPdf.execute({
      number: Number(req.params.number),
      page,
    });

    res.download(file.file, file.fileName, async () => {
      await fs.unlink(file.file);
    });

    // res.contentType('application/pdf');
    // res.send(file.buffer);
  }
  async index2(req: Request, res: Response): Promise<void> {
    const exportTestHtml = container.resolve(ExportTestHtmlService);

    const file = await exportTestHtml.execute();

    // res.download(file.file, file.fileName, async () => {
    //   await fs.unlink(file.file);
    // });

    // res.contentType('application/html');

    res.setHeader('Content-Type', 'text/html');

    res.send(file.html);
  }
}

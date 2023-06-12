import axios from 'axios';
import fs from 'node:fs';
import { inject, injectable } from 'tsyringe';

import { htmlToPdfConfig } from '@config/htmlToPdf';

import { IParseMailTemplateDTO } from '../../MailTemplateProvider/dtos/IParseMailTemplateDTO';
import { IMailTemplateProvider } from '../../MailTemplateProvider/models/IMailTemplateProvider';
import type { IHtmlToPdfProvider } from '../models/IHtmlToPdfProvider';

@injectable()
export class WkHtmlToPdfOnDockerProvider implements IHtmlToPdfProvider {
  constructor(
    @inject('MailTemplateProvider')
    private mailTemplateProvider: IMailTemplateProvider,
  ) { } // eslint-disable-line

  public async generate(
    pathFileOutput: string,
    templateData: IParseMailTemplateDTO,
  ): Promise<string> {
    const filledTemplate = await this.mailTemplateProvider.parse(templateData);

    const response = await axios.post(
      htmlToPdfConfig.config.wkhtmltopdf.url,
      {
        content: filledTemplate,
        options: {
          pageSize: 'a4',
        },
      },
      {
        responseType: 'stream',
      },
    );
    await response.data.pipe(fs.createWriteStream(pathFileOutput));

    // const file = fs.statSync(pathFileOutput);

    // const fileSize = file.size / (1024 * 1024);

    return pathFileOutput;
  }
}

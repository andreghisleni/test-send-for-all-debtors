import { formatValueToBRL } from '@utils/formatValueToBRL';
import { format } from 'date-fns';
import path from 'node:path';
import { inject, injectable } from 'tsyringe';

import { uploadConfig } from '@config/upload';

import { IMailTemplateProvider } from '@shared/container/providers/MailTemplateProvider/models/IMailTemplateProvider';
import { INavigatorProvider } from '@shared/container/providers/NavigatorProvider/models/INavigatorProvider';
import { prisma } from '@shared/infra/prisma';

type IResponse = {
  file: string;
  fileName: string;
  buffer?: Buffer;
};

type IRequest = {
  number: number;
};

@injectable()
export class ExportTestPdfService {
  constructor(
    @inject('NavigatorProvider')
    private navigatorProvider: INavigatorProvider,
    @inject('MailTemplateProvider')
    private mailTemplateProvider: IMailTemplateProvider,
  ) { }// eslint-disable-line

  public async execute({ number }: IRequest): Promise<IResponse> {
    const test = path.resolve(__dirname, '..', 'views', 'teste.hbs');
    const data = await prisma.coletivas_sacola.findMany({
      where: {
        numero: number,
      },
      select: {
        venda: {
          select: {
            obs: true,
          },
        },
        client: {
          select: {
            nome: true,
          },
        },
        coin: {
          select: {
            codigo: true,
          },
        },
        coletiva: {
          select: {
            data: true,
          },
        },
        qtde: true,
        valor: true,
      },
    });

    if (!data) {
      throw new Error('Data not found');
    }

    const html = await this.mailTemplateProvider.parse({
      file: test,
      variables: {
        data: data.map(item => ({
          obs: item.venda?.obs,
          name: item.client?.nome,
          coin: item.coin?.codigo,
          date: format(new Date(item.coletiva?.data || ''), 'dd/MM/yyyy'),
          qtde: item.qtde,
          value: formatValueToBRL(item?.valor || 0),
        })),
      },
    });

    const page = await this.navigatorProvider.newPage(html);

    const fileName = `${Date.now()}-id-${number}-export-postites.pdf`;

    const filePath = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'tmp',
      'uploads',
      fileName,
    );

    const buffer = await this.navigatorProvider.savePdf(
      page,
      filePath,
      'postite',
    );

    await this.navigatorProvider.closePage(page);

    return {
      file: path.resolve(uploadConfig.uploadsFolder, fileName),
      fileName,
      buffer,
    };
  }
}

import { toBuffer } from 'bwip-js';
import path from 'node:path';
import { inject, injectable } from 'tsyringe';

import { IMailTemplateProvider } from '@shared/container/providers/MailTemplateProvider/models/IMailTemplateProvider';
import { INavigatorProvider } from '@shared/container/providers/NavigatorProvider/models/INavigatorProvider';
import { AppError } from '@shared/errors/AppError';
import { prisma } from '@shared/infra/prisma';

type IResponse = {
  pdf?: Buffer;
  html?: string;
};

type IRequest = {
  id: number;
  type: 'pdf' | 'html';
};

@injectable()
export class GenerateProductPostiteService {
  constructor(
    @inject('NavigatorProvider')
    private navigatorProvider: INavigatorProvider,
    @inject('MailTemplateProvider')
    private mailTemplateProvider: IMailTemplateProvider,
  ) { }// eslint-disable-line

  public async execute({ id, type }: IRequest): Promise<IResponse> {
    const productPostiteTemplate = path.resolve(__dirname, '..', 'views', 'product-postite.hbs');
    const product = await prisma.moedas.findUnique({
      where: {
        id,
      },
    });

    if (!product) {
      throw new AppError('Product not found');
    }

    const barcode = await toBuffer({
      bcid: 'code128', // Tipo de código de barras
      text: product.codigo || 'hi', // Texto a ser codificado
      scale: 3, // Escala do código de barras
      height: 10, // Altura do código de barras
      // includetext: true, // Incluir o texto no código de barras
      textxalign: 'center', // Alinhamento do texto
    });

    const html = await this.mailTemplateProvider.parse({
      file: productPostiteTemplate,
      variables: {
        name: 'Marcon Numismática',
        product: {
          name: product.nome,
          code: product.codigo,
        },
        barcode: barcode.toString('base64'),
      },
    });
    console.log(type);

    if (type === 'html') {
      return {
        html,
      };
    }

    const page = await this.navigatorProvider.newPage(html);

    const pdf = await this.navigatorProvider.savePdf(page, undefined, 'postite');

    await this.navigatorProvider.closePage(page);

    return {
      pdf,
    };
  }
}

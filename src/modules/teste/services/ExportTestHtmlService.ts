import { formatValueToBRL } from '@utils/formatValueToBRL';
import { format } from 'date-fns';
import path from 'node:path';
import { inject, injectable } from 'tsyringe';

import { IMailTemplateProvider } from '@shared/container/providers/MailTemplateProvider/models/IMailTemplateProvider';
import { prisma } from '@shared/infra/prisma';

type IResponse = {
  html: string;
};

@injectable()
export class ExportTestHtmlService {
  constructor(
    @inject('MailTemplateProvider')
    private mailTemplateProvider: IMailTemplateProvider,
  ) { }// eslint-disable-line

  public async execute(/* { }: IRequest */): Promise<IResponse> {
    const test = path.resolve(__dirname, '..', 'views', 'teste.hbs');

    const data = await prisma.coletivas_sacola.findMany({
      where: {
        numero: 10,
      },
      // include: {
      //   venda: {
      //     select: {
      //       obs: true,
      //     },
      //   },
      //   client: {
      //     select: {
      //       nome: true,
      //     },
      //   },
      //   coin: {
      //     select: {
      //       codigo: true,
      //     },
      //   },
      // },
      select: {
        venda: {
          select: {
            obs: true,
          },
        },
        client: {
          select: {
            id: true,
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
          clientId: item.client.id,
        })),
      },
    });

    return {
      html, // : `${JSON.stringify(data, null, 2)}`,
    };
  }
}

import { Prisma, vendas } from '@prisma/client';
import { formatValueToBRL } from '@utils/formatValueToBRL';
import { format, parseISO } from 'date-fns';
import path from 'node:path';
import { container, inject, injectable } from 'tsyringe';

import { ICacheProvider } from '../../CacheProvider/models/ICacheProvider';
import { IMailTemplateProvider } from '../../MailTemplateProvider/models/IMailTemplateProvider';
import { INavigatorProvider } from '../../NavigatorProvider/models/INavigatorProvider';
import { IBackendJobsProvider } from '../models/IBackendJobsProvider';

type IVenda = vendas &
  Prisma.vendasGetPayload<{
    select: {
      formapagar: true;
      clientes: true;
      produtos: {
        include: {
          product: {
            include: {
              country: true;
            };
          };
        };
      };
      receber: true;
    };
  }> & { total: number; totalRecebido: number };

interface IDataProps {
  cachePrefix: string;
  folderPath: string;
  folderName: string;

  venda: IVenda;

  extractPdfTemplate: string;
  email: string;
  sendLinkDownloadTemplate: string;
}

@injectable()
class Handle {
  constructor(
    @inject('MailTemplateProvider')
    private mailTemplateProvider: IMailTemplateProvider,

    @inject('NavigatorProvider')
    private navigatorProvider: INavigatorProvider,

    @inject('BackendJobsProvider')
    private backendJobsProvider: IBackendJobsProvider,

    @inject('CacheProvider')
    private cacheProvider: ICacheProvider,
  ) { } // eslint-disable-line


  private async generatePdf(
    venda: IVenda,
    folderName: string,
    extractPdfTemplate: string,
  ): Promise<string> {
    console.log('Starting generate pdf for venda: ', venda.id_venda);

    const fDate = (d: Date | null) => {
      if (!d) return '';

      return d instanceof Date
        ? format(d, 'dd/MM/yyyy')
        : format(parseISO(d), 'dd/MM/yyyy');
    };
    const fDate2 = (d: Date | null) => {
      if (!d) return '';

      return d instanceof Date
        ? format(d, 'yyyy-MM-dd')
        : format(parseISO(d), 'yyyy-MM-dd');
    };

    const html = await this.mailTemplateProvider.parse({
      file: extractPdfTemplate,
      variables: {
        logo: 'http://localhost:3333/public/logo-marcon.png',
        id_venda: venda.id_venda,
        nome_cliente: venda.clientes?.nome || '',
        data_venda: fDate(venda.data),
        produtos: venda.produtos.map(produto => ({
          nome: produto.product?.nome || '',
          data: fDate(produto.datasaida),
          code: produto.product?.codigo || '',
          ano: produto.product?.ano || '',
          origem: produto.product?.country?.nomepais || '',
          quantidade: produto.qtde || 0,
          valor: formatValueToBRL(produto.valor || 0),
        })),
        valor_frete: formatValueToBRL(venda.frete || 0),
        valor_desconto: formatValueToBRL(venda.desconto || 0),
        qtd_total: venda.produtos.reduce(
          (acc, curr) => acc + (curr.qtde || 0),
          0,
        ),
        valor_total: formatValueToBRL(venda.total || 0),
        pagamentos: venda.receber.map(pagamento => ({
          data: fDate(pagamento.data),
          valor: formatValueToBRL(pagamento.valor || 0),
          tipo: venda.formapagar?.nomepagamento || '',
        })),
        saldo: formatValueToBRL(venda.totalRecebido - venda.total),
        img_pix: 'http://localhost:3333/public/pix.png',
      },
    });
    const page = await this.navigatorProvider.newPage(html);

    const name = `${venda.id_venda} - ${venda.clientes?.nome || ''} - ${fDate2(
      venda.data,
    )}`
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[&@\/\\#,+()$~%.'":*?<>{}]/g, ''); // eslint-disable-line no-useless-escape

    const pathFile = path.resolve(folderName, `${name}.pdf`);

    await this.navigatorProvider.savePdf(page, pathFile);

    await this.navigatorProvider.closePage(page);

    console.log('Pdf generated for venda: ', venda.id_venda);

    return pathFile;
  }

  public async execute({
    data: {
      cachePrefix,
      folderPath,
      folderName,
      venda,
      extractPdfTemplate,
      email,
      sendLinkDownloadTemplate,
    },
  }: {
    data: IDataProps;
  }): Promise<void> {
    await this.generatePdf(venda, folderPath, extractPdfTemplate);

    console.log(await this.cacheProvider.recover<number>(cachePrefix, true));

    const countTotalRest =
      ((await this.cacheProvider.recover<number>(cachePrefix, true)) || 0) - 1;

    await this.cacheProvider.save(cachePrefix, countTotalRest, true);

    if (countTotalRest <= 0) {
      console.log('Sending email to: ', email);

      await this.backendJobsProvider.addQueue('ZipFolderAndSendEmail', {
        folderPath,
        folderName,
        email,
        sendLinkDownloadTemplate,
      });

      await this.cacheProvider.invalidate(cachePrefix);
    } else {
      console.log('Sending email to: test ');
    }
  }
}

export default {
  key: 'GeneratePdf',
  limiter: {
    max: 1,
    duration: 5000,
  },
  handle: async ({ data }: { data: IDataProps }): Promise<void> => {
    const handle = container.resolve(Handle);

    await handle.execute({ data });
  },
};

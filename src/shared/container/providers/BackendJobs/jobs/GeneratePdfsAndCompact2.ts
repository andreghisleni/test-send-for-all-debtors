import { env } from '@env';
import { Prisma, vendas } from '@prisma/client';
import { formatValueToBRL } from '@utils/formatValueToBRL';
import AdmZip from 'adm-zip';
import fs from 'node:fs';
import path from 'node:path';
import { container, inject, injectable } from 'tsyringe';

import { formatDateToBR } from '../../../../../utils/formatDate';
import { formatDateToUS } from '../../../../../utils/formatDate';
import { ICacheProvider } from '../../CacheProvider/models/ICacheProvider';
import { IHtmlToPdfProvider } from '../../HtmlToPdfProvider/models/IHtmlToPdfProvider';
import { IMailProvider } from '../../MailProvider/models/IMailProvider';
import { IStorageProvider } from '../../StorageProvider/models/IStorageProvider';

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
  extractPdfTemplate: string;

  email: string;
  sendLinkDownloadTemplate: string;

  cachePrefix: string;
}

@injectable()
class Handle {
  constructor(
    @inject('StorageProvider')
    private storageProvider: IStorageProvider,

    @inject('MailProvider')
    private mailProvider: IMailProvider,

    @inject('CacheProvider')
    private cacheProvider: ICacheProvider,

    @inject('HtmlToPdfProvider')
    private htmlToPdfProvider: IHtmlToPdfProvider,
  ) { } // eslint-disable-line


  private async generatePdf(
    venda: IVenda,
    folderName: string,
    extractPdfTemplate: string,
  ): Promise<string> {
    const vcn = venda.clientes?.nome || '';

    const name = `${venda.id_venda} - ${vcn} - ${formatDateToUS(venda.data)}`
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[&@\/\\#,+()$~%.'":*?<>{}]/g, ''); // eslint-disable-line no-useless-escape

    const pathFile = path.resolve(folderName, `${name}.pdf`);

    await this.htmlToPdfProvider.generate(pathFile, {
      file: extractPdfTemplate,
      variables: {
        logo: 'http://host.docker.internal:3333/public/logo-marcon.png',
        id_venda: venda.id_venda,
        nome_cliente: venda.clientes?.nome || '',
        data_venda: formatDateToBR(venda.data),
        produtos: venda.produtos.map(produto => ({
          nome: produto.product?.nome || '',
          data: formatDateToBR(produto.datasaida),
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
          data: formatDateToBR(pagamento.data),
          valor: formatValueToBRL(pagamento.valor || 0),
          tipo: venda.formapagar?.nomepagamento || '',
        })),
        saldo: formatValueToBRL(venda.totalRecebido - venda.total),
        img_pix: 'http://host.docker.internal:3333/public/pix.png',
      },
    });

    console.log('Pdf generated for venda: ', venda.id_venda);

    return pathFile;
  }

  public async execute({
    data: { cachePrefix, extractPdfTemplate, email, sendLinkDownloadTemplate },
  }: {
    data: IDataProps;
  }): Promise<void> {
    const fName = `devedores-extratos-${new Date().getTime()}`;

    const folderName = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      '..',
      '..',
      'tmp',
      `${fName}`,
    );

    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName);
    }

    const vendas = await this.cacheProvider.recover<IVenda[]>(
      cachePrefix,
      true,
    );

    if (!vendas) {
      throw new Error('Vendas not found');
    }

    // const perChunk = 100; // items per chunk

    // const result = splitArray(vendas, perChunk);

    fs.writeFileSync(
      path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        '..',
        '..',
        '..',
        'tmp',
        `test.json`,
      ),
      JSON.stringify(vendas, null, 2),
    );

    // eslint-disable-next-line no-restricted-syntax
    // for (const vendasChunk of result) {
    // eslint-disable-next-line no-await-in-loop
    await Promise.all(
      vendas.map(async venda =>
        this.generatePdf(venda, folderName, extractPdfTemplate),
      ),
    );
    // }

    const zip = new AdmZip();

    const folderZipName = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      '..',
      '..',
      'tmp',
      `${fName}.zip`,
    );

    zip.addLocalFolder(folderName);
    zip.writeZip(folderZipName);

    const file = await this.storageProvider.saveFile(`${fName}.zip`, true);

    console.log(`${env.APP_API_URL}/downloads/${file}`);

    fs.rmdirSync(folderName, { recursive: true });

    await this.cacheProvider.invalidate(cachePrefix);

    await this.mailProvider.sendMail({
      to: {
        name: 'Gasparzim',
        email,
      },
      subject: `[${process.env.APP_NAME}] Download de extratos devedores`,
      templateData: {
        file: sendLinkDownloadTemplate,
        variables: {
          link: `${env.APP_API_URL}/downloads/${file}`,
        },
      },
    });
  }
}

export default {
  key: 'GeneratePdfsAndCompact2',
  limiter: {
    max: 1,
    duration: 5000,
  },
  handle: async ({ data }: { data: IDataProps }): Promise<void> => {
    const handle = container.resolve(Handle);

    await handle.execute({ data });
  },
};

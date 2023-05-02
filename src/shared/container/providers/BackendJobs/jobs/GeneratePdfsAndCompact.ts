import { env } from '@env';
import { Prisma, vendas } from '@prisma/client';
import { formatValueToBRL } from '@utils/formatValueToBRL';
import { splitArray } from '@utils/splitArray';
import AdmZip from 'adm-zip';
import { format, parseISO } from 'date-fns';
import fs from 'node:fs';
import path from 'node:path';
import puppeteer, { Browser } from 'puppeteer';
import { container, inject, injectable } from 'tsyringe';

import { IMailProvider } from '../../MailProvider/models/IMailProvider';
import { IMailTemplateProvider } from '../../MailTemplateProvider/models/IMailTemplateProvider';
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
  vendas: IVenda[];
  extractPdfTemplate: string;

  email: string;
  sendLinkDownloadTemplate: string;
}

@injectable()
class Handle {
  constructor(
    @inject('MailTemplateProvider')
    private mailTemplateProvider: IMailTemplateProvider,

    @inject('StorageProvider')
    private storageProvider: IStorageProvider,

    @inject('MailProvider')
    private mailProvider: IMailProvider,
  ) { } // eslint-disable-line


  private async generatePdf(
    browser: Browser,
    venda: IVenda,
    folderName: string,
    extractPdfTemplate: string,
  ): Promise<string> {
    const fDate = (d: Date | null) => {
      return d && d instanceof Date
        ? format(parseISO(d.toDateString()), 'dd/MM/yyyy')
        : '';
    };
    const fDate2 = (d: Date | null) => {
      return d && d instanceof Date
        ? format(parseISO(d.toDateString()), 'yyyy-MM-dd')
        : '';
    };

    const htmlToPdf = await this.mailTemplateProvider.parse({
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

    const page = await browser.newPage();

    await page.setContent(htmlToPdf);

    const div_selector_to_remove = '.padding';
    await page.evaluate(sel => {
      const elements = document.querySelectorAll(sel);
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < elements.length; i++) {
        elements[i]?.classList?.remove('padding');
      }
    }, div_selector_to_remove);

    const name = `${venda.id_venda} - ${venda.clientes?.nome || ''} - ${fDate2(
      venda.data,
    )}`
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[&@\/\\#,+()$~%.'":*?<>{}]/g, ''); // eslint-disable-line no-useless-escape

    const pathFile = path.resolve(folderName, `${name}.pdf`);

    await page.pdf({
      path: pathFile,
      printBackground: true,
      format: 'A4',
      displayHeaderFooter: true,
      margin: {
        top: '1.5cm',
        right: '1.5cm',
        bottom: '2.5cm',
        left: '1.5cm',
      },
      headerTemplate: '<div />',
      footerTemplate:
        '<div style="font-size: 11px !important; overflow: auto; margin-left: 1.5cm; margin-right: 1.5cm; color: ghostwhite;">Página <span class="pageNumber"></span> de <span class="totalPages"></span></div>',
    });

    await page.close();

    return pathFile;
  }

  public async execute({
    data: { vendas, extractPdfTemplate, email, sendLinkDownloadTemplate },
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

    const browser = await puppeteer.launch({
      headless: 'new',
    });

    const perChunk = 4; // items per chunk

    const result = splitArray(vendas, perChunk) as IVenda[][];

    // eslint-disable-next-line no-restricted-syntax
    for (const vendasChunk of result) {
      // eslint-disable-next-line no-await-in-loop
      await Promise.all(
        vendasChunk.map(async venda =>
          this.generatePdf(browser, venda, folderName, extractPdfTemplate),
        ),
      );
    }

    await browser.close();

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

    fs.rmdirSync(folderName, { recursive: true });

    const file = await this.storageProvider.saveFile(`${fName}.zip`, true);

    console.log(`${env.APP_API_URL}/downloads/${file}`);

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
  key: 'GeneratePdfsAndCompact',
  limiter: {
    max: 10,
    duration: 5000,
  },
  handle: async ({ data }: { data: IDataProps }): Promise<void> => {
    const handle = container.resolve(Handle);
    await handle.execute({ data });
  },
};

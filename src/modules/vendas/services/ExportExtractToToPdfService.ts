import { env } from '@env';
import { formatValueToBRL } from '@utils/formatValueToBRL';
import { format } from 'date-fns';
import path from 'node:path';
import puppeteer from 'puppeteer';
import { inject, injectable } from 'tsyringe';

import type { IMailProvider } from '@shared/container/providers/MailProvider/models/IMailProvider';
import type { IMailTemplateProvider } from '@shared/container/providers/MailTemplateProvider/models/IMailTemplateProvider';
import AppError from '@shared/errors/AppError';
import { prisma } from '@shared/infra/prisma';

interface IRequest {
  id_venda: number;
  type: 'pdf' | 'html';
}

interface IResponse {
  html: string;
  pdf: Buffer;
}
@injectable()
export class ExportExtractToToPdfService {
  constructor(
    @inject('MailTemplateProvider')
    private mailTemplateProvider: IMailTemplateProvider,

    @inject('MailProvider')
    private mailProvider: IMailProvider,
  ) { } // eslint-disable-line

  public async execute({ id_venda, type }: IRequest): Promise<IResponse> {
    const devedor = await prisma.vendas.findUnique({
      include: {
        formapagar: true,
        clientes: true,
        produtos: {
          include: {
            product: {
              include: {
                country: true,
              },
            },
          },
        },
        receber: {
          orderBy: {
            data: 'asc',
          },
        },
      },
      where: {
        id_venda,
      },
    });

    if (!devedor) {
      throw new AppError('Venda não encontrada');
    }

    const devedore = {
      ...devedor,
      total:
        devedor.produtos.reduce(
          (acc, curr) => acc + (curr.valor || 0) * (curr.qtde || 0),
          0,
        ) -
        (devedor.desconto || 0) +
        (devedor.frete || 0),
      totalRecebido: devedor.receber.reduce(
        (acc, curr) => acc + (curr.valor || 0),
        0,
      ),
    };

    const fDate = (d: Date | null) => (d ? format(d, 'dd/MM/yyyy') : '');

    // const fileName = await this.excelGeneratorProvider.generate({
    //   fileName: `${Date.now()}-export-devedores.xlsx`,
    //   sheets: [
    //     {
    //       name: 'all',
    //       data: [
    //         ...devedores.map(devedor => ({
    //           Cliente: devedor.clientes?.nome || '',
    //           'Data da Venda': fDate(devedor.data),
    //           OBS: devedor.obs || '',
    //           'id venda': devedor.id_venda,
    //           Venda: formatValueToBRL(devedor.total || 0),
    //           'Total Pago': formatValueToBRL(devedor.totalRecebido || 0),
    //           'Ultimo Pagamento': fDate(
    //             devedor.receber[devedor.receber.length - 1]?.data,
    //           ),

    //           'Valor ultimo Pagamento': formatValueToBRL(
    //             devedor.receber[devedor.receber.length - 1]?.valor || 0,
    //           ),
    //           'Saldo Devedor': formatValueToBRL(
    //             devedor.total - devedor.totalRecebido,
    //           ),
    //         })),
    //         {
    //           Cliente: '',
    //           'Data da Venda': '',
    //           OBS: '',
    //           'id venda': '',
    //           Venda: '',
    //           'Total Pago': '',
    //           'Ultimo Pagamento': '',
    //           'Valor ultimo Pagamento': 'Total',
    //           'Saldo Devedor': parsedData.totalDevedor,
    //         },
    //       ],
    //     },
    //   ],
    // });

    const extractPdfTemplate = path.resolve(
      __dirname,
      '..',
      'views',
      'extract_pdf.hbs',
    );

    // await this.mailProvider.sendMail({
    //   to: {
    //     name: devedore.clientes?.nome || '',
    //     email: 'andre@andreg.com.br',
    //   },
    //   subject: 'Extrato de Venda',
    //   templateData: {
    //     file: extractPdfTemplate,
    //     variables: {
    //       logo: 'http://localhost:3333/public/logo-marcon.png',
    //       id_venda: devedore.id_venda,
    //       nome_cliente: devedore.clientes?.nome || '',
    //       data_venda: fDate(devedore.data),
    //       produtos: devedore.produtos.map(produto => ({
    //         nome: produto.product?.nome || '',
    //         data: fDate(produto.datasaida),
    //         code: produto.product?.codigo || '',
    //         ano: produto.product?.ano || '',
    //         origem: produto.product?.country?.nomepais || '',
    //         quantidade: produto.qtde || 0,
    //         valor: formatValueToBRL(produto.valor || 0),
    //       })),
    //       valor_frete: formatValueToBRL(devedore.frete || 0),
    //       valor_desconto: formatValueToBRL(devedore.desconto || 0),
    //       qtd_total: devedore.produtos.reduce(
    //         (acc, curr) => acc + (curr.qtde || 0),
    //         0,
    //       ),
    //       valor_total: formatValueToBRL(devedore.total || 0),
    //       pagamentos: devedore.receber.map(pagamento => ({
    //         data: fDate(pagamento.data),
    //         valor: formatValueToBRL(pagamento.valor || 0),
    //         tipo: devedor.formapagar?.nomepagamento || '',
    //       })),
    //       saldo: formatValueToBRL(devedore.totalRecebido - devedore.total),
    //       img_pix: 'http://localhost:3333/public/pix.png',
    //     },
    //   },
    // });

    let html = '';

    if (type === 'html') {
      html = await this.mailTemplateProvider.parse({
        file: extractPdfTemplate,
        variables: {
          logo: `${env.APP_API_URL}/public/logo-marcon.png`,
          id_venda: devedore.id_venda,
          nome_cliente: devedore.clientes?.nome || '',
          data_venda: fDate(devedore.data),
          produtos: devedore.produtos.map(produto => ({
            nome: produto.product?.nome || '',
            data: fDate(produto.datasaida),
            code: produto.product?.codigo || '',
            ano: produto.product?.ano || '',
            origem: produto.product?.country?.nomepais || '',
            quantidade: produto.qtde || 0,
            valor: formatValueToBRL(produto.valor || 0),
          })),
          valor_frete: formatValueToBRL(devedore.frete || 0),
          valor_desconto: formatValueToBRL(devedore.desconto || 0),
          qtd_total: devedore.produtos.reduce(
            (acc, curr) => acc + (curr.qtde || 0),
            0,
          ),
          valor_total: formatValueToBRL(devedore.total || 0),
          pagamentos: devedore.receber.map(pagamento => ({
            data: fDate(pagamento.data),
            valor: formatValueToBRL(pagamento.valor || 0),
            tipo: devedor.formapagar?.nomepagamento || '',
          })),
          saldo: formatValueToBRL(devedore.totalRecebido - devedore.total),
          img_pix: `${env.APP_API_URL}/public/pix.png`,
        },
      });
    }

    let buffer = Buffer.from('');

    if (type === 'pdf') {
      const htmlToPdf = await this.mailTemplateProvider.parse({
        file: extractPdfTemplate,
        variables: {
          logo: 'http://localhost:3333/public/logo-marcon.png',
          id_venda: devedore.id_venda,
          nome_cliente: devedore.clientes?.nome || '',
          data_venda: fDate(devedore.data),
          produtos: devedore.produtos.map(produto => ({
            nome: produto.product?.nome || '',
            data: fDate(produto.datasaida),
            code: produto.product?.codigo || '',
            ano: produto.product?.ano || '',
            origem: produto.product?.country?.nomepais || '',
            quantidade: produto.qtde || 0,
            valor: formatValueToBRL(produto.valor || 0),
          })),
          valor_frete: formatValueToBRL(devedore.frete || 0),
          valor_desconto: formatValueToBRL(devedore.desconto || 0),
          qtd_total: devedore.produtos.reduce(
            (acc, curr) => acc + (curr.qtde || 0),
            0,
          ),
          valor_total: formatValueToBRL(devedore.total || 0),
          pagamentos: devedore.receber.map(pagamento => ({
            data: fDate(pagamento.data),
            valor: formatValueToBRL(pagamento.valor || 0),
            tipo: devedor.formapagar?.nomepagamento || '',
          })),
          saldo: formatValueToBRL(devedore.totalRecebido - devedore.total),
          img_pix: 'http://localhost:3333/public/pix.png',
        },
      });

      const browser = await puppeteer.launch({
        headless: 'new',
      });

      const page = await browser.newPage();

      await page.setContent(htmlToPdf);

      await page.screenshot({ path: 'example.png' });

      const div_selector_to_remove = '.padding';
      await page.evaluate(sel => {
        const elements = document.querySelectorAll(sel);
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < elements.length; i++) {
          elements[i]?.classList?.remove('padding');
        }
      }, div_selector_to_remove);

      buffer = await page.pdf({
        path: 'example.pdf',
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

      await browser.close();
    }

    return {
      pdf: buffer,
      html,
    };
  }
}

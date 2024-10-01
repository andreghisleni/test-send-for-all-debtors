import { Prisma, vendas } from '@prisma/client';
import { formatValueToBRL } from '@utils/formatValueToBRL';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import FormData from 'form-data';
import fs from 'node:fs';
import path from 'node:path';
import { inject, injectable } from 'tsyringe';

import { IBackendJobsProvider } from '@shared/container/providers/BackendJobs/models/IBackendJobsProvider';
import { IMailTemplateProvider } from '@shared/container/providers/MailTemplateProvider/models/IMailTemplateProvider';
import { prisma } from '@shared/infra/prisma';

interface IRequest {
  email: string;
}

interface IResponse {
  file: string;
}

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
      creditos: true;
    };
  }> & { total: number; totalRecebido: number; totalCreditos: number };

@injectable()
export class ExportExtractAllToToPdfService2 {
  constructor(
    @inject('BackendJobsProvider')
    private backendJobsProvider: IBackendJobsProvider,

    @inject('MailTemplateProvider')
    private mailTemplateProvider: IMailTemplateProvider,
  ) { } // eslint-disable-line

  private async parseHTML({
    extractPdfTemplate,
    venda,
  }: {
    extractPdfTemplate: string;
    venda: IVenda;
  }): Promise<string> {
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

    return this.mailTemplateProvider.parse({
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
        credito: formatValueToBRL(venda.totalCreditos),
        img_pix: 'http://localhost:3333/public/pix.png',
      },
    });
  }

  public async execute({ email }: IRequest): Promise<IResponse> {
    const extractPdfTemplate = path.resolve(
      __dirname,
      '..',
      'views',
      'extract_pdf.hbs',
    );
    const sendLinkDownloadTemplate = path.resolve(
      __dirname,
      '..',
      'views',
      'send_link_download.hbs',
    );

    const vendas = await prisma.vendas.findMany({
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
        creditos: {
          orderBy: {
            data: 'asc',
          },
        },
      },
      where: {
        status: 1,
      },
      orderBy: {
        clientes: {
          nome: 'asc',
        },
      },
    });

    const devedores = vendas
      .map(devedor => ({
        ...devedor,
        total:
          devedor.produtos.reduce(
            (acc, curr) => acc + (curr.valor || 0) * (curr.qtde || 0),
            0,
          ) -
          (devedor.desconto || 0) +
          (devedor.frete || 0) -
          devedor.creditos.reduce((acc, curr) => acc + (curr.valor || 0), 0),
        totalRecebido: devedor.receber.reduce(
          (acc, curr) => acc + (curr.valor || 0),
          0,
        ),
        totalCreditos: devedor.creditos.reduce(
          (acc, curr) => acc + (curr.valor || 0),
          0,
        ),
      }))
      .filter(devedor => devedor.total > devedor.totalRecebido);

    //       const fs = require('fs');
    // const axios = require('axios');
    // const FormData = require('form-data');
    // +const Mustache = require('mustache');
    // +
    // +const data = {
    // +  invoiceNumber: "#12345"
    // +}

    // const generation = {
    // 	html: 'template.html',
    // };

    const filledTemplate = await this.parseHTML({
      extractPdfTemplate,
      venda: devedores[0],
    });

    const body = new FormData();
    body.append('template.html', filledTemplate, { filename: 'template.html' });
    body.append(
      'generation',
      JSON.stringify({
        html: 'template.html',
      }),
    );

    const response = await axios.post('http://localhost:5000/process', body, {
      headers: body.getHeaders(),
      responseType: 'stream',
    });
    await response.data.pipe(fs.createWriteStream('invoice.pdf'));

    console.log('file saved!');

    // await this.backendJobsProvider.addQueue('GeneratePdfsAndCompact', {
    //   vendas: devedores,
    //   extractPdfTemplate,
    //   email,
    //   sendLinkDownloadTemplate,
    // });

    return {
      file: 'aa',
    };
  }
}

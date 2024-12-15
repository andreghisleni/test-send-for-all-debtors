import { formatValueToBRL } from '@utils/formatValueToBRL';
import { format } from 'date-fns';
import path from 'node:path';
import { inject, injectable } from 'tsyringe';

import { uploadConfig } from '@config/upload';

import type { IExcelGeneratorProvider } from '@shared/container/providers/ExcelGeneratorProvider/models/IExcelGeneratorProvider';
import { prisma } from '@shared/infra/prisma';

// interface IRequest {
// }

interface IResponse {
  file: string;
  fileName: string;
}

const fDate = (d: Date | null) => (d ? format(new Date(new Date(d).toISOString().split('T')[0].concat('T04:00:00.000Z')), 'dd/MM/yyyy') : '');

@injectable()
export class ExportDevedoresToExelService {
  constructor(
    @inject('ExcelGeneratorProvider')
    private excelGeneratorProvider: IExcelGeneratorProvider,
  ) { }// eslint-disable-line

  public async execute(/* { }: IRequest */): Promise<IResponse> {
    const vendas = await prisma.vendas.findMany({
      include: {
        formapagar: true,
        clientes: true,
        produtos: {
          orderBy: {
            datasaida: 'asc',
          },
        },
        receber: {
          orderBy: {
            data: 'asc',
          },
        },
        creditos: true,
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
      .map(devedor => {
        let dataPrimeiroProdutoAposUltimoPagamento = null;
        const ultimoPagamento = devedor.receber.length > 0 ? devedor.receber[devedor.receber.length - 1].data : null;

        if (ultimoPagamento) {
          for (const produto of devedor.produtos) {
            if (produto.datasaida > ultimoPagamento) {
              dataPrimeiroProdutoAposUltimoPagamento = produto.datasaida;
              break;
            }
          }
        }

        return {
          ...devedor,
          total: devedor.produtos.reduce((acc: number, curr) => acc + (curr.valor || 0) * (curr.qtde || 0), 0) - (devedor.desconto || 0) + (devedor.frete || 0),
          totalRecebido: Number(devedor.receber.reduce((acc: number, curr) => acc + (curr.valor || 0), 0)) + Number(devedor.creditos.reduce((acc: number, curr) => acc + (curr.valor || 0), 0)),
          totalCreditos: devedor.creditos.reduce((acc: number, curr) => acc + (curr.valor || 0), 0),

          dataPrimeiroProdutoAposUltimoPagamento, // Novo campo adicionado
        };
      })
      .filter(devedor => devedor.total > Number(devedor?.totalRecebido));

    const vTotal = devedores.reduce((acc, curr) => acc + (curr.total - curr.totalRecebido), 0);

    const parsedData = {
      total: devedores.length,
      totalDevedor: formatValueToBRL(vTotal),
    };

    const fileName = await this.excelGeneratorProvider.generate({
      fileName: `${Date.now()}-export-devedores.xlsx`,
      sheets: [
        {
          name: 'all',
          data: [
            ...devedores.map(devedor => ({
              Cliente: devedor.clientes?.nome || '',
              'Data da Venda': fDate(devedor.data),
              OBS: devedor.obs || '',
              'id venda': devedor.id_venda,
              Venda: formatValueToBRL(devedor.total || 0),
              'Total Pago': formatValueToBRL(devedor.totalRecebido || 0),
              'Total Creditos': formatValueToBRL(devedor.totalCreditos || 0),
              'Ultimo Pagamento': fDate(devedor.receber[devedor.receber.length - 1]?.data),

              'Valor ultimo Pagamento': formatValueToBRL(devedor.receber[devedor.receber.length - 1]?.valor || 0),
              'Saldo Devedor': formatValueToBRL(devedor.total - devedor.totalRecebido),

              'Data Primeiro Produto Apos Ultimo Pagamento': fDate(devedor.dataPrimeiroProdutoAposUltimoPagamento), // Novo campo adicionado
            })),
            {
              Cliente: '',
              'Data da Venda': '',
              OBS: '',
              'id venda': '',
              Venda: '',
              'Total Pago': '',
              'Ultimo Pagamento': '',
              'Valor ultimo Pagamento': 'Total',
              'Saldo Devedor': parsedData.totalDevedor,
            },
          ],
        },
      ],
    });

    return {
      file: path.resolve(uploadConfig.uploadsFolder, fileName),
      fileName,
    };
  }
}

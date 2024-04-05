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

@injectable()
export class ExportVendasToExcelService {
  constructor(
    @inject('ExcelGeneratorProvider')
    private excelGeneratorProvider: IExcelGeneratorProvider,
  ) { }// eslint-disable-line

  public async execute(/* { }: IRequest */): Promise<IResponse> {
    const vendas = await prisma.vendas.findMany({
      include: {
        formapagar: true,
        clientes: true,
        produtos: true,
        receber: {
          orderBy: {
            data: 'asc',
          },
        },
      },
      orderBy: {
        clientes: {
          nome: 'asc',
        },
      },
    });

    const MappedVendas = vendas.map(venda => ({
      ...venda,
      total: venda.produtos.reduce((acc, curr) => acc + (curr.valor || 0) * (curr.qtde || 0), 0) - (venda.desconto || 0) + (venda.frete || 0), // eslint-disable-line
      totalRecebido: venda.receber.reduce((acc, curr) => acc + (curr.valor || 0), 0), // eslint-disable-line
    }));

    const vTotal = MappedVendas.reduce((acc, curr) => acc + (curr.total - curr.totalRecebido), 0);

    const parsedData = {
      total: MappedVendas.length,
      totalVenda: formatValueToBRL(vTotal),
    };
    const fDate = (d: Date | null) => (d ? format(d, 'dd/MM/yyyy') : '');

    const fileName = await this.excelGeneratorProvider.generate({
      fileName: `${Date.now()}-export-vendaes.xlsx`,
      sheets: [
        {
          name: 'all',
          data: [
            ...MappedVendas.map(venda => ({
              Cliente: venda.clientes?.nome || '',
              'id venda': venda.id_venda,
              'Total da venda': formatValueToBRL(venda.total || 0),
              'Total Pago': formatValueToBRL(venda.totalRecebido || 0),
              'Data da Venda': fDate(venda.data),

              'Ultimo Pagamento': fDate(venda.receber[venda.receber.length - 1]?.data),
              'Valor ultimo Pagamento': formatValueToBRL(venda.receber[venda.receber.length - 1]?.valor || 0),
              'Saldo Venda': formatValueToBRL(venda.total - venda.totalRecebido),
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
              'Saldo Devido': parsedData.totalVenda,
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

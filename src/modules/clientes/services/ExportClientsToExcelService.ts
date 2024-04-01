import { clientes, Prisma } from '@prisma/client';
import { formatValueToBRL } from '@utils/formatValueToBRL';
import path from 'node:path';
import { inject, injectable } from 'tsyringe';

import { uploadConfig } from '@config/upload';

import type { IExcelGeneratorProvider } from '@shared/container/providers/ExcelGeneratorProvider/models/IExcelGeneratorProvider';
import { prisma } from '@shared/infra/prisma';
import { format } from 'date-fns';

// interface IRequest {
// }

interface IResponse {
  file: string;
  fileName: string;
}

export type IClient = clientes &
  Prisma.clientesGetPayload<{
    include: {
      vendas: {
        include: {
          produtos: true;
        };
      };
    };
  }>;

type ICliente = clientes & {
  vendas: {
    frete: number;
    desconto: number;
    produtos: {
      valor: number;
      qtde: number;
    }[];
  }[];
};

@injectable()
export class ExportClientsToExcelService {
  constructor(
    @inject('ExcelGeneratorProvider')
    private excelGeneratorProvider: IExcelGeneratorProvider,
  ) { }// eslint-disable-line

  public async execute(/* { }: IRequest */): Promise<IResponse> {
    const clients = await prisma.clientes.findMany({
      include: {
        vendas: {
          include: {
            produtos: true,
          },
        },
      },
      orderBy: {
        nome: 'asc',
      },
    });

    const parsedClients = (clients as ICliente[]).map(
      ({ vendas, ...client }) => ({
        ...client,

        total: formatValueToBRL(
          vendas.reduce(
            (acc, curr) =>
              acc +
              curr.produtos.reduce(
                (acc, curr) => acc + (curr.valor || 0) * (curr.qtde || 0),
                0,
              ) +
              (curr.frete || 0) -
              (curr.desconto || 0),
            0,
          ),
        ),
        total_venda: vendas.length,
      }),
    );

    const fileName = await this.excelGeneratorProvider.generate({
      fileName: `${Date.now()}-export-clients.xlsx`,
      sheets: [
        {
          name: 'all',
          data: [
            ...parsedClients.map(clients => ({
              Nome: clients.nome,
              'E-mail': clients.email,
              CPF: clients.cpf || '',
              Telefone: clients.celular,
              Cidade: clients.cidade,
              Endereço: clients.endereco,
              Total: clients.total,
              'Total de Vendas': clients.total_venda,
              'Criado em': clients.datacadas ? format(new Date(clients.datacadas), 'dd-MM-yyyy') : '',
              'Origem': clients.origem || '',
            })),
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

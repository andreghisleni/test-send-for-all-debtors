import path from 'node:path';
import { inject, injectable } from 'tsyringe';

import { IBackendJobsProvider } from '@shared/container/providers/BackendJobs/models/IBackendJobsProvider';
import { ICacheProvider } from '@shared/container/providers/CacheProvider/models/ICacheProvider';
import { prisma } from '@shared/infra/prisma';

interface IRequest {
  email: string;
}

interface IResponse {
  file: string;
}

@injectable()
export class ExportExtractAllToToPdfService2 {
  constructor(
    @inject('BackendJobsProvider')
    private backendJobsProvider: IBackendJobsProvider,

    @inject('CacheProvider')
    private cacheProvider: ICacheProvider,
  ) { } // eslint-disable-line

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
          (devedor.frete || 0),
        totalRecebido: devedor.receber.reduce(
          (acc, curr) => acc + (curr.valor || 0),
          0,
        ),
      }))
      .filter(devedor => devedor.total > devedor.totalRecebido);

    const cachePrefix = `devedores:${email}:${devedores.length}:${Date.now()}`;

    await this.cacheProvider.save(cachePrefix, devedores, true);

    await this.backendJobsProvider.addQueue('GeneratePdfsAndCompact2', {
      cachePrefix,
      extractPdfTemplate,
      email,
      sendLinkDownloadTemplate,
    });

    return {
      file: 'aa',
    };
  }
}

import { Prisma, vendas } from '@prisma/client';
import { inject, injectable } from 'tsyringe';

import { ICacheProvider } from '@shared/container/providers/CacheProvider/models/ICacheProvider';
import { AppError } from '@shared/errors/AppError';

interface IRequest {
  prefix: string;
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
    };
  }> & { total: number; totalRecebido: number };

interface IResponse {
  devedores: IVenda[];
}

@injectable()
export class GetDataFromRedisService {
  constructor(
    @inject('CacheProvider')
    private cacheProvider: ICacheProvider,
  ) { } // eslint-disable-line

  public async execute({ prefix }: IRequest): Promise<IResponse> {
    const vendas = await this.cacheProvider.recover<IVenda[]>(prefix, true);

    if (vendas === null) {
      throw new AppError('Não foi possível recuperar os dados do cache');
    }

    return {
      devedores: vendas,
    };
  }
}

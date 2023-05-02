import type { IExcelGeneratorDTO } from '../dtos/IExcelGeneratorDTO';

export interface IExcelGeneratorProvider {
  generate(data: IExcelGeneratorDTO): Promise<string>;
}

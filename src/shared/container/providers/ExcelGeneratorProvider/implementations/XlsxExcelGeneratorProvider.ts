import path from 'node:path';
import xlsx from 'xlsx';

import { uploadConfig } from '@config/upload';

import { IExcelGeneratorDTO } from '../dtos/IExcelGeneratorDTO';
import { IExcelGeneratorProvider } from '../models/IExcelGeneratorProvider';

export class XlsxExcelGeneratorProvider implements IExcelGeneratorProvider {
  public async generate({
    fileName,
    sheets,
  }: IExcelGeneratorDTO): Promise<string> {
    const wb = xlsx.utils.book_new();

    sheets.forEach(({ name, data }) => {
      xlsx.utils.book_append_sheet(wb, xlsx.utils.json_to_sheet(data), name);
    });

    const { uploadsFolder } = uploadConfig;

    const pathToGenerate = path.resolve(uploadsFolder, fileName);

    xlsx.writeFile(wb, pathToGenerate);

    return fileName;
  }
}

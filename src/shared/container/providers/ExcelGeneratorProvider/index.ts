import { container } from 'tsyringe';

import { XlsxExcelGeneratorProvider } from './implementations/XlsxExcelGeneratorProvider';
import { IExcelGeneratorProvider } from './models/IExcelGeneratorProvider';

const providers = {
  xlsx: XlsxExcelGeneratorProvider,
};

container.registerSingleton<IExcelGeneratorProvider>(
  'ExcelGeneratorProvider',
  providers.xlsx,
);

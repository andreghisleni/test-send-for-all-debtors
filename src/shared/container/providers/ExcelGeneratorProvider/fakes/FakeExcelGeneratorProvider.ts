import { IExcelGeneratorProvider } from '../models/IExcelGeneratorProvider';

export class FakeExcelGeneratorProvider implements IExcelGeneratorProvider {
  public async generate(): Promise<string> {
    return 'File path';
  }
}

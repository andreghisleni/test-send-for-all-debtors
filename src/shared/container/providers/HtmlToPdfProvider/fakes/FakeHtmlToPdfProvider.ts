import type { IHtmlToPdfProvider } from '../models/IHtmlToPdfProvider';

export class FakeHtmlToPdfProvider implements IHtmlToPdfProvider {
  public async generate(): Promise<string> {
    return 'fake-pdf-file-path';
  }
}

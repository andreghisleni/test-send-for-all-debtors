import type { ISendMailDTO } from '../dtos/ISendMailDTO';
import type { IMailProvider } from '../models/IMailProvider';

export class FakeMailProvider implements IMailProvider {
  private messages: ISendMailDTO[] = [];

  public async sendMail(message: ISendMailDTO): Promise<void> {
    this.messages.push(message);
  }
}

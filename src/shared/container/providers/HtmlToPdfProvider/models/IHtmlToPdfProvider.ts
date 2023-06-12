import { IParseMailTemplateDTO } from '../../MailTemplateProvider/dtos/IParseMailTemplateDTO';

export interface IHtmlToPdfProvider {
  generate(
    pathFileOutput: string,
    templateData: IParseMailTemplateDTO,
  ): Promise<string>;
}

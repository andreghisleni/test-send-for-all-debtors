import { env } from '@env';
import AdmZip from 'adm-zip';
import fs from 'node:fs';
import path from 'node:path';
import { container, inject, injectable } from 'tsyringe';

import { IMailProvider } from '../../MailProvider/models/IMailProvider';
import { IMailTemplateProvider } from '../../MailTemplateProvider/models/IMailTemplateProvider';
import { IStorageProvider } from '../../StorageProvider/models/IStorageProvider';

interface IDataProps {
  folderPath: string;
  folderName: string;

  email: string;
  sendLinkDownloadTemplate: string;
}

@injectable()
class Handle {
  constructor(
    @inject('MailTemplateProvider')
    private mailTemplateProvider: IMailTemplateProvider,

    @inject('MailProvider')
    private mailProvider: IMailProvider,

    @inject('StorageProvider')
    private storageProvider: IStorageProvider,
  ) { } // eslint-disable-line

  public async execute({
    data: { folderPath, folderName, email, sendLinkDownloadTemplate },
  }: {
    data: IDataProps;
  }): Promise<void> {
    const zip = new AdmZip();

    const folderZipName = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      '..',
      '..',
      'tmp',
      `${folderName}.zip`,
    );

    zip.addLocalFolder(folderPath);
    zip.writeZip(folderZipName);

    fs.rmdirSync(folderPath, { recursive: true });

    const file = await this.storageProvider.saveFile(`${folderName}.zip`, true);

    console.log(`${env.APP_API_URL}/downloads/${file}`);

    await this.mailProvider.sendMail({
      to: {
        name: 'Gasparzim',
        email,
      },
      subject: `[${process.env.APP_NAME}] Download de extratos devedores`,
      templateData: {
        file: sendLinkDownloadTemplate,
        variables: {
          link: `${env.APP_API_URL}/downloads/${file}`,
        },
      },
    });
  }
}

export default {
  key: 'ZipFolderAndSendEmail',
  limiter: {
    max: 1,
    duration: 5000,
  },
  handle: async ({ data }: { data: IDataProps }): Promise<void> => {
    const handle = container.resolve(Handle);

    await handle.execute({ data });
  },
};

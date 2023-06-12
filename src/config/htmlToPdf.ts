import { env } from '@env';

interface IHtmlToPdfConfig {
  driver: 'wkhtmltopdf';

  config: {
    wkhtmltopdf: {
      url: string;
    };
  };
}

export const htmlToPdfConfig: IHtmlToPdfConfig = {
  driver: 'wkhtmltopdf',
  config: {
    wkhtmltopdf: {
      url: env.WKHTMLTOPDF_URL,
    },
  },
};

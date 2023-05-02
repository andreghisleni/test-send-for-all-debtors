import { env } from '@env';

interface IMailConfig {
  driver: 'ethereal' | 'ses';
  defaults: {
    from: {
      email: string;
      name: string;
    };
  };
}

export default {
  driver: env.MAIL_DRIVER || 'ethereal',
  defaults: {
    from: {
      email: 'envio@andreg.com.br',
      name: 'Equipe Marcon',
    },
  },
} as IMailConfig;

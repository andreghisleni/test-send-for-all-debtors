import { container } from 'tsyringe';

import { GeocodeProvider } from './implementations/GeocodeProvider';
import { IGeocodeProvider } from './models/IGeocodeProvider';

const providers = {
  google: GeocodeProvider,
};

container.registerSingleton<IGeocodeProvider>(
  'GeocodeProvider',
  providers.google,
);

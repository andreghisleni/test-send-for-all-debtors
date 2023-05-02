import { container } from 'tsyringe';

import { GeocodeProvider } from './implementations/GeocodeProvider';
import type { IGeocodeProvider } from './models/IGeocodeProvider';

const providers = {
  google: GeocodeProvider,
};

container.registerSingleton<IGeocodeProvider>(
  'GeocodeProvider',
  providers.google,
);

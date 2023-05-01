import { env } from '@env';
import { Client } from '@googlemaps/google-maps-services-js';

import { IGeocodeProvider } from '../models/IGeocodeProvider';

export class GeocodeProvider implements IGeocodeProvider {
  private client: Client;

  constructor() {
    this.client = new Client({});
  }

  public async get(address: string): Promise<{ lat: number; lng: number }> {
    const {
      data: {
        results: [
          {
            geometry: { location: cordinates },
          },
        ],
      },
    } = await this.client.geocode({
      params: {
        key: `${env.GOOGLE_MAPS_API_KEY}`,
        address,
      },
    });

    return cordinates;
  }
}

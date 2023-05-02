import type { IGeocodeProvider } from '../models/IGeocodeProvider';

export class FakeGeocodeProvider implements IGeocodeProvider {
  public async get(_: string): Promise<{ lat: number; lng: number }> {
    return {
      lat: -23.564983,
      lng: -46.6523,
    };
  }
}

export interface IGeocodeProvider {
  get(address: string): Promise<{ lat: number; lng: number }>;
}

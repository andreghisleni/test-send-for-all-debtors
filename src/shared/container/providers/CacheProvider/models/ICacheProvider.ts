export interface ICacheProvider {
  save(key: string, value: any, important?: boolean): Promise<void>;
  recover<T>(key: string, important?: boolean): Promise<T | null>;
  invalidate(key: string): Promise<void>;
  invalidatePrefix(prefix: string): Promise<void>;
}

export interface IStorageProvider {
  saveFile(file: string, isDownload?: boolean): Promise<string>;
  deleteFile(file: string): Promise<void>;
}

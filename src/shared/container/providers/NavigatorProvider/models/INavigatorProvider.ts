import { Page } from 'puppeteer';

export interface INavigatorProvider {
  newBrowser(): Promise<void>;
  newPage(html: string): Promise<Page>;
  savePdf(
    page: Page,
    path?: string,
    format?: 'postite' | 'A4',
  ): Promise<Buffer>;
  saveScreenshot(page: Page, path: string): Promise<void>;
  closePage(page: Page): Promise<void>;
  closeBrowser(): Promise<void>;
}

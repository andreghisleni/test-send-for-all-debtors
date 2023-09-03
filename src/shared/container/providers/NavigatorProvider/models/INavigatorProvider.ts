import { Page } from 'puppeteer';

export interface INavigatorProvider {
  newBrowser(): Promise<void>;
  newPage(html: string): Promise<Page>;
  savePdf(page: Page, path: string): Promise<void>;
  saveScreenshot(page: Page, path: string): Promise<void>;
  closePage(page: Page): Promise<void>;
  closeBrowser(): Promise<void>;
}

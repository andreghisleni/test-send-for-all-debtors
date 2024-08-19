import puppeteer, { Browser, Page } from 'puppeteer';

import { AppError } from '@shared/errors/AppError';

import { INavigatorProvider } from '../models/INavigatorProvider';

export class PuppeteerNavigatorProvider implements INavigatorProvider {
  private browser: Browser | null = null;

  public async newBrowser(): Promise<void> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
      });
    }
  }

  private async verifyBrowser(): Promise<Browser> {
    if (!this.browser) {
      throw new AppError('Browser not found');
    }

    return this.browser;
  }

  public async newPage(html: string): Promise<Page> {
    const b = await this.verifyBrowser();

    const page = await b.newPage();

    await page.setContent(html, { waitUntil: 'networkidle0' });

    return page;
  }

  public async savePdf(
    page: Page,
    path?: string,
    format: 'postite' | 'A4' = 'A4',
  ): Promise<Buffer> {
    const props = format === 'postite' ? { width: '105mm', height: '22mm', } : format === 'A4' ? { format: 'A4' } : { format: 'A4' }; // eslint-disable-line

    return page.pdf({
      path,
      printBackground: true,
      ...(props as any),
      displayHeaderFooter: true,
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0',
      },
    });
  }

  public async saveScreenshot(page: Page, path: string): Promise<void> {
    await page.screenshot({
      path,
      // fullPage: true,
      clip: {
        width: 800,
        height: 1123,
        x: 0,
        y: 0,
      },
    });
  }

  public async closePage(page: Page): Promise<void> {
    await page.close();
  }

  public async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

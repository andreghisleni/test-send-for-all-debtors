import { inject, injectable } from 'tsyringe';

import { INavigatorProvider } from '@shared/container/providers/NavigatorProvider/models/INavigatorProvider';

@injectable()
export class Navigator {
  constructor(
    @inject('NavigatorProvider')
    private navigatorProvider: INavigatorProvider,
  ) { } // eslint-disable-line

  async newBrowser(): Promise<void> {
    await this.navigatorProvider.newBrowser();
  }

  async closeBrowser(): Promise<void> {
    await this.navigatorProvider.closeBrowser();
  }
}

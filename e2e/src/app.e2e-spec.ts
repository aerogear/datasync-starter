import { element, by } from 'protractor';

describe('App', () => {
  it('AeroGear logo should be visible', async () => {
    await element(by.xpath('/html/body/app-root/ion-app/ion-split-pane/ion-router-outlet/app-home/ion-header/ion-toolbar/ion-buttons')).click();
    await element(by.xpath('/html/body/app-root/ion-app/ion-split-pane/ion-menu/ion-content/ion-list/ion-menu-toggle[2]/ion-item')).click();
  });
});

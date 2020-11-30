import { fakeAsync } from '@angular/core/testing';
import {
  ExternalNavigationWindowHandling,
  NavigationParamsType,
  NavigationService,
  TimeRangeService
} from '@hypertrace/common';
import { createHostFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { ButtonComponent } from '../button/button.component';
import { OpenInNewTabComponent } from './open-in-new-tab.component';

describe('Open in new tab component', () => {
  let spectator: Spectator<OpenInNewTabComponent>;

  const createHost = createHostFactory({
    shallow: true,
    component: OpenInNewTabComponent,
    declarations: [MockComponent(ButtonComponent)],
    providers: [
      mockProvider(TimeRangeService, {
        getShareableCurrentUrl: () => 'url-from-timerangeservice'
      }),
      mockProvider(NavigationService)
    ]
  });

  test('should call navigate as expected when URL input is not specified', fakeAsync(() => {
    spectator = createHost('<ht-open-in-new-tab></ht-open-in-new-tab>');

    spectator.click('.open-in-new-tab-button');
    spectator.tick();

    expect(spectator.inject(NavigationService).navigate).toHaveBeenCalledWith({
      navType: NavigationParamsType.External,
      windowHandling: ExternalNavigationWindowHandling.NewWindow,
      url: 'url-from-timerangeservice'
    });
  }));

  test('should call navigate as expected when URL input is specified', fakeAsync(() => {
    spectator = createHost('<ht-open-in-new-tab [url]="url"></ht-open-in-new-tab>', {
      hostProps: {
        url: 'input-url'
      }
    });

    spectator.click('.open-in-new-tab-button');
    spectator.tick();

    expect(spectator.inject(NavigationService).navigate).toHaveBeenCalledWith({
      navType: NavigationParamsType.External,
      windowHandling: ExternalNavigationWindowHandling.NewWindow,
      url: 'input-url'
    });
  }));
});

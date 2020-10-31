import { fakeAsync } from '@angular/core/testing';
import { IconLibraryTestingModule } from '@hypertrace/assets-library';
import {
  ExternalNavigationWindowHandling,
  NavigationParamsType,
  NavigationService,
  TimeRangeService
} from '@hypertrace/common';
import { OpenInNewTabComponent, OpenInNewTabModule } from '@hypertrace/components';
import { createHostFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';

describe('Open in new tab component', () => {
  let spectator: Spectator<OpenInNewTabComponent>;

  const createHost = createHostFactory({
    declareComponent: false,
    component: OpenInNewTabComponent,
    imports: [OpenInNewTabModule, IconLibraryTestingModule],
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

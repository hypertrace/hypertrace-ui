import { fakeAsync } from '@angular/core/testing';
import { NavigationService, TimeRangeService } from '@hypertrace/common';
import { createHostFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { IconSize } from '../icon/icon-size';
import { IconComponent } from '../icon/icon.component';
import { LinkComponent } from '../link/link.component';
import { OpenInNewTabComponent } from './open-in-new-tab.component';

describe('Open in new tab component', () => {
  let spectator: Spectator<OpenInNewTabComponent>;

  const createHost = createHostFactory({
    shallow: true,
    component: OpenInNewTabComponent,
    declarations: [MockComponent(LinkComponent), MockComponent(IconComponent)],
    providers: [
      mockProvider(TimeRangeService, {
        getShareableCurrentUrl: () => 'url-from-timerangeservice'
      }),
      mockProvider(NavigationService, {
        buildNavigationParams: jest.fn().mockReturnValue({
          path: [
            '/external',
            {
              url: 'http://test.hypertrace.ai',
              navType: 'same_window'
            }
          ],
          extras: { skipLocationChange: true }
        })
      })
    ]
  });

  test('Open in new tab component should not be displayed if paramsOrUrl is undefined', () => {
    spectator = createHost(`<ht-open-in-new-tab [paramsOrUrl]="paramsOrUrl"></ht-open-in-new-tab>`, {
      hostProps: {
        paramsOrUrl: undefined
      }
    });
    expect(spectator.query('.open-in-new-tab')).not.toExist();
  });

  test(`Open in new tab component should exist if paramsOrUrl is not undefined`, fakeAsync(() => {
    spectator = createHost(`<ht-open-in-new-tab [paramsOrUrl]="paramsOrUrl"></ht-open-in-new-tab>`, {
      hostProps: {
        paramsOrUrl: {}
      }
    });
    expect(spectator.query('.open-in-new-tab')).toExist();
    expect(spectator.query('ht-link')).toExist();
    // Default value of icon size
    expect(spectator.component.iconSize).toBe(IconSize.Medium);
  }));

  test(`Open in new tab component should contain icon of passed size`, fakeAsync(() => {
    spectator = createHost(
      `<ht-open-in-new-tab [paramsOrUrl]="paramsOrUrl" [iconSize]="iconSize" ></ht-open-in-new-tab>`,
      {
        hostProps: {
          paramsOrUrl: {},
          iconSize: IconSize.Small
        }
      }
    );
    expect(spectator.query('.open-in-new-tab')).toExist();
    expect(spectator.query('ht-link')).toExist();
    // Expected value of icon size if pass
    expect(spectator.component.iconSize).toBe(IconSize.Small);
  }));
});

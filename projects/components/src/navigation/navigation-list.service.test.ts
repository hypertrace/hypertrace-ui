import { ActivatedRoute } from '@angular/router';
import { IconType } from '@hypertrace/assets-library';
import { NavigationService, NavItemType } from '@hypertrace/common';
import { NavigationListService } from '@hypertrace/components';
import { createServiceFactory, mockProvider, SpectatorService } from '@ngneat/spectator/jest';

describe('Navigation List Service', () => {
  let spectator: SpectatorService<NavigationListService>;

  const buildService = createServiceFactory({
    service: NavigationListService,
    providers: [
      mockProvider(ActivatedRoute),
      mockProvider(NavigationService, { getRouteConfig: jest.fn().mockReturnValue({
          path: 'root',
          data: { features: ['test-feature'] },
          children: []
        })}),
    ]
  });

  beforeEach(() => {
    spectator = buildService();
  });

  test('decorating navItem with features work as expected', () => {
    expect(
      spectator.service.decorateNavItem(
        {
          type: NavItemType.Header,
          label: 'Label'
        },
        spectator.inject(ActivatedRoute)
      )
    ).toEqual({ type: NavItemType.Header, label: 'Label' });

    expect(
      spectator.service.decorateNavItem(
        {
          type: NavItemType.Link,
          label: 'Label',
          icon: IconType.None,
          matchPaths: ['root']
        },
        spectator.inject(ActivatedRoute)
      )
    ).toEqual({
      type: NavItemType.Link,
      label: 'Label',
      icon: IconType.None,
      matchPaths: ['root'],
      features: ['test-feature']
    });
  });
});

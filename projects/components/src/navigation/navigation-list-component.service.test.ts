import { FeatureState, FeatureStateResolver , NavItemConfig, NavItemHeaderConfig, NavItemType } from '@hypertrace/common';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { NavigationListComponentService } from './navigation-list-component.service';

describe('Navigation List Component Service', () => {
  const navItems: NavItemConfig[] = [
    {
      type: NavItemType.Header,
      label: 'header 1'
    },
    {
      type: NavItemType.Link,
      icon: 'icon',
      label: 'label-1',
      features: ['feature'],
      matchPaths: ['']
    },
    {
      type: NavItemType.Link,
      icon: 'icon',
      label: 'label-2',
      matchPaths: ['']
    },
    {
      type: NavItemType.Header,
      label: 'header 2'
    }
  ];

  const createService = createServiceFactory({
    service: NavigationListComponentService,
    providers: [
      mockProvider(FeatureStateResolver, {
        getCombinedFeatureState: jest.fn().mockReturnValue(of(FeatureState.Enabled))
      })
    ]
  });

  test('should return correct visibility for both headers', () => {
    const spectator = createService();
    const resolvedItems = spectator.service.resolveFeaturesAndUpdateVisibilityForNavItems(navItems);

    runFakeRxjs(({ expectObservable }) => {
      expectObservable((resolvedItems[0] as NavItemHeaderConfig).isVisible$!).toBe('(x|)', {
        x: true
      });
      expectObservable((resolvedItems[3] as NavItemHeaderConfig).isVisible$!).toBe('(x|)', {
        x: false
      });
    });
  });
});

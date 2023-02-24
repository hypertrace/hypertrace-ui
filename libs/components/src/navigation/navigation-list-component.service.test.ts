import {
  FeatureState,
  FeatureStateResolver,
  PageTimeRangePreferenceService,
  RelativeTimeRange,
  TimeDuration,
  TimeUnit
} from '@hypertrace/common';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { NavigationListComponentService } from './navigation-list-component.service';
import { NavItemConfig, NavItemHeaderConfig, NavItemType } from './navigation.config';

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

  const mockTimeRangeResolver = () => new RelativeTimeRange(new TimeDuration(1, TimeUnit.Hour));

  const createService = createServiceFactory({
    service: NavigationListComponentService,
    providers: [
      mockProvider(FeatureStateResolver, {
        getCombinedFeatureState: jest.fn().mockReturnValue(of(FeatureState.Enabled)),
        getFeatureState: jest.fn().mockReturnValue(of(FeatureState.Enabled))
      }),
      mockProvider(PageTimeRangePreferenceService, {
        getTimeRangePreferenceForPage: jest.fn().mockReturnValue(of(mockTimeRangeResolver))
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

  test('should return nav items with time ranges on them', () => {
    const mockNavItems: NavItemConfig[] = [
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
    const spectator = createService();
    const resolvedItems$ = spectator.service.resolveNavItemConfigTimeRanges(mockNavItems);

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(resolvedItems$).toBe('(x|)', {
        x: [
          {
            type: NavItemType.Header,
            label: 'header 1'
          },
          {
            type: NavItemType.Link,
            icon: 'icon',
            label: 'label-1',
            features: ['feature'],
            matchPaths: [''],
            timeRangeResolver: mockTimeRangeResolver,
            pageLevelTimeRangeIsEnabled: true
          },
          {
            type: NavItemType.Link,
            icon: 'icon',
            label: 'label-2',
            matchPaths: [''],
            timeRangeResolver: mockTimeRangeResolver,
            pageLevelTimeRangeIsEnabled: true
          },
          {
            type: NavItemType.Header,
            label: 'header 2'
          }
        ]
      });
    });
  });
});

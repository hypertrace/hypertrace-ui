import {
  FeatureState,
  FeatureStateResolver,
  NavigationService,
  PreferenceService,
  SubscriptionLifecycle
} from '@hypertrace/common';
import { createHostFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { of } from 'rxjs';
import { BreadcrumbsService } from '../../breadcrumbs/breadcrumbs.service';
import { FeatureConfigCheckModule } from '../../feature-check/feature-config-check.module';
import { PageHeaderComponent, PageHeaderDisplayMode } from './page-header.component';
import { TimeRangeComponent } from '../../time-range/time-range.component';

describe('Page Header Component', () => {
  let spectator: Spectator<PageHeaderComponent>;

  const createHost = createHostFactory({
    component: PageHeaderComponent,
    imports: [FeatureConfigCheckModule],
    declarations: [MockComponent(TimeRangeComponent)],
    shallow: true,
    providers: [
      mockProvider(NavigationService),
      mockProvider(PreferenceService),
      mockProvider(SubscriptionLifecycle),
      mockProvider(FeatureStateResolver, {
        getCombinedFeatureState: () => of(FeatureState.Disabled)
      }),
      mockProvider(BreadcrumbsService, {
        breadcrumbs$: of([
          {
            label: 'I am Breadcrumb'
          }
        ])
      })
    ]
  });

  test('should display beta tag', () => {
    spectator = createHost('<ht-page-header isBeta="true"></ht-page-header>');
    expect(spectator.query('.beta')).toExist();
  });

  test('should not display beta tag by default', () => {
    spectator = createHost('<ht-page-header></ht-page-header>');
    expect(spectator.query('.beta')).not.toExist();
  });

  test('should display page time range component when feature flag is enabled', () => {
    spectator = createHost('<ht-page-header></ht-page-header>', {
      providers: [
        mockProvider(FeatureStateResolver, {
          getCombinedFeatureState: () => of(FeatureState.Enabled)
        })
      ]
    });

    expect(spectator.query(TimeRangeComponent)).toExist();
  });

  test('should display page time range component when with time range mode is selected', () => {
    spectator = createHost('<ht-page-header [hidePageTimeRange]="hidePageTimeRange"></ht-page-header>', {
      hostProps: {
        hidePageTimeRange: true
      },
      providers: [
        mockProvider(FeatureStateResolver, {
          getCombinedFeatureState: () => of(FeatureState.Enabled)
        })
      ]
    });

    expect(spectator.component.mode).toBe(PageHeaderDisplayMode.Default);
    expect(spectator.query(TimeRangeComponent)).not.toExist();
  });

  test('should display page time range component when with time range mode is selected', () => {
    spectator = createHost('<ht-page-header [mode]="mode"></ht-page-header>', {
      hostProps: {
        mode: PageHeaderDisplayMode.WithTimeRange
      },
      providers: [
        mockProvider(FeatureStateResolver, {
          getCombinedFeatureState: () => of(FeatureState.Enabled)
        })
      ]
    });

    expect(spectator.query(TimeRangeComponent)).toExist();
  });

  test('should not display any time range if FF is disabled', () => {
    spectator = createHost('<ht-page-header></ht-page-header>', {
      providers: [
        mockProvider(FeatureStateResolver, {
          getCombinedFeatureState: () => of(FeatureState.Disabled)
        })
      ]
    });

    expect(spectator.query(TimeRangeComponent)).not.toExist();
  });

  test('should show the refresh button', () => {
    spectator = createHost('<ht-page-header [mode]="mode"></ht-page-header>', {
      hostProps: {
        mode: PageHeaderDisplayMode.WithRefreshButton
      },
      providers: [
        mockProvider(FeatureStateResolver, {
          getCombinedFeatureState: () => of(FeatureState.Enabled)
        })
      ]
    });
    expect(spectator.query('.refresh-only-button')).toExist();
    expect(spectator.query(TimeRangeComponent)).not.toExist();
  });

  test('should not show standalone refresh button when time range is shown', () => {
    spectator = createHost('<ht-page-header [mode]="mode"></ht-page-header>', {
      hostProps: {
        mode: PageHeaderDisplayMode.WithTimeRange
      }
    });
    expect(spectator.query('.refresh-only-button')).not.toExist();
  });
});

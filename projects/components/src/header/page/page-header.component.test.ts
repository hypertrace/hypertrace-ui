import {
  ApplicationFeature,
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
import { PageTimeRangeComponent } from '../../page-time-range/page-time-range.component';
import { TimeRangeComponent } from '../../time-range/time-range.component';
import { PageHeaderComponent } from './page-header.component';

describe('Page Header Component', () => {
  let spectator: Spectator<PageHeaderComponent>;

  const createHost = createHostFactory({
    component: PageHeaderComponent,
    imports: [FeatureConfigCheckModule],
    declarations: [MockComponent(PageTimeRangeComponent), MockComponent(TimeRangeComponent)],
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

  test('should display page time range component when feature flags are enabled', () => {
    spectator = createHost('<ht-page-header></ht-page-header>', {
      providers: [
        mockProvider(FeatureStateResolver, {
          getCombinedFeatureState: () => of(FeatureState.Enabled)
        })
      ]
    });

    expect(spectator.query(PageTimeRangeComponent)).toExist();
    expect(spectator.query(TimeRangeComponent)).not.toExist();
  });

  test('should display time-range component when navigation feature flag is disabled and page time range is enabled', () => {
    spectator = createHost('<ht-page-header></ht-page-header>', {
      providers: [
        mockProvider(FeatureStateResolver, {
          getCombinedFeatureState: jest.fn().mockImplementation(([feature]) => {
            if (feature === ApplicationFeature.NavigationRedesign) {
              return of(FeatureState.Disabled);
            }

            return of(FeatureState.Enabled);
          })
        })
      ]
    });

    expect(spectator.query(PageTimeRangeComponent)).not.toExist();
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

    expect(spectator.query(PageTimeRangeComponent)).not.toExist();
    expect(spectator.query(TimeRangeComponent)).not.toExist();
  });
});

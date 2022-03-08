import {
  FeatureState,
  FeatureStateResolver,
  NavigationService,
  PreferenceService,
  SubscriptionLifecycle
} from '@hypertrace/common';
import { FeatureConfigCheckModule, TimeRangeComponent } from '@hypertrace/components';
import { UserSpecifiedTimeRangeSelectorComponent } from '@hypertrace/observability';
import { createHostFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { of } from 'rxjs';
import { ApplicationFeature } from '../../../../../src/app/shared/constants/application-feature';
import { BreadcrumbsService } from '../../breadcrumbs/breadcrumbs.service';
import { PageHeaderComponent } from './page-header.component';

describe('Page Header Component', () => {
  let spectator: Spectator<PageHeaderComponent>;

  const createHost = createHostFactory({
    component: PageHeaderComponent,
    imports: [FeatureConfigCheckModule],
    declarations: [MockComponent(UserSpecifiedTimeRangeSelectorComponent), MockComponent(TimeRangeComponent)],
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

  test('should display user-specified-time-range-selector when feature flags are enabled', () => {
    spectator = createHost('<ht-page-header></ht-page-header>', {
      providers: [
        mockProvider(FeatureStateResolver, {
          getCombinedFeatureState: () => of(FeatureState.Enabled)
        })
      ]
    });

    expect(spectator.query(UserSpecifiedTimeRangeSelectorComponent)).toExist();
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

    expect(spectator.query(UserSpecifiedTimeRangeSelectorComponent)).not.toExist();
    expect(spectator.query(TimeRangeComponent)).toExist();
  });
});

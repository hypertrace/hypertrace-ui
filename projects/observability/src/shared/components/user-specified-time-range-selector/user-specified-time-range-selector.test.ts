import { UrlSegment } from '@angular/router';
import {
  FeatureState,
  FeatureStateResolver,
  NavigationService,
  RelativeTimeRange,
  TimeDuration,
  TimeRangeForPageService,
  TimeUnit
} from '@hypertrace/common';
import { FeatureConfigCheckModule, TimeRangeComponent } from '@hypertrace/components';
import { createHostFactory, mockProvider, SpectatorHost } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { of } from 'rxjs';
import { UserSpecifiedTimeRangeSelector } from './user-specified-time-range-selector.component';

describe('Page time range component', () => {
  let spectator: SpectatorHost<UserSpecifiedTimeRangeSelector>;
  const route = {
    snapshot: {
      data: {
        defaultTimeRange: undefined
      }
    },
    pathFromRoot: { flatMap: jest.fn().mockReturnValue(['foo']) }
  };

  const createHost = createHostFactory({
    shallow: true,
    component: UserSpecifiedTimeRangeSelector,
    declarations: [MockComponent(TimeRangeComponent)],
    imports: [FeatureConfigCheckModule],
    providers: [
      mockProvider(NavigationService, {
        getCurrentActivatedRoute: jest.fn().mockReturnValue(route)
      }),
      mockProvider(TimeRangeForPageService),
      mockProvider(FeatureStateResolver, {
        getCombinedFeatureState: () => of(FeatureState.Enabled)
      })
    ]
  });

  test('should not attempt to save time range when route does not have default range', () => {
    spectator = createHost(`<ht-time-range-for-page></ht-time-range-for-page>`);
    const timeRange = new RelativeTimeRange(new TimeDuration(2, TimeUnit.Hour));

    const timeRangeComponent = spectator.query(TimeRangeComponent);
    expect(timeRangeComponent).toExist();

    spyOn(spectator.component, 'savePageTimeRange');
    spectator.component.onTimeRangeSelected(timeRange);
    expect(spectator.component.savePageTimeRange).not.toHaveBeenCalled();
  });

  test('should not attempt to save time range when route is not a first level route', () => {
    spectator = createHost(`<ht-time-range-for-page></ht-time-range-for-page>`, {
      providers: [
        mockProvider(NavigationService, {
          getCurrentActivatedRoute: jest.fn().mockReturnValue({
            snapshot: {
              data: {
                defaultTimeRange: undefined
              }
            },
            pathFromRoot: { flatMap: jest.fn().mockReturnValue(['parent-path', 'child-path']) }
          })
        })
      ]
    });
    const timeRange = new RelativeTimeRange(new TimeDuration(2, TimeUnit.Hour));

    const timeRangeComponent = spectator.query(TimeRangeComponent);
    expect(timeRangeComponent).toExist();

    spyOn(spectator.component, 'savePageTimeRange');
    spectator.component.onTimeRangeSelected(timeRange);
    expect(spectator.component.savePageTimeRange).not.toHaveBeenCalled();
  });

  test('should save time range when route is first level, and the defaultTimeRange property is present', () => {
    spectator = createHost(`<ht-time-range-for-page></ht-time-range-for-page>`, {
      providers: [
        mockProvider(NavigationService, {
          getCurrentActivatedRoute: jest.fn().mockReturnValue({
            snapshot: {
              data: {
                defaultTimeRange: new RelativeTimeRange(new TimeDuration(30, TimeUnit.Minute))
              }
            },
            pathFromRoot: { flatMap: () => [{ path: 'parent-path' }] as UrlSegment[] }
          })
        })
      ]
    });
    const selectedTimeRange = new RelativeTimeRange(new TimeDuration(2, TimeUnit.Hour));

    const timeRangeComponent = spectator.query(TimeRangeComponent);
    expect(timeRangeComponent).toExist();

    spyOn(spectator.component, 'savePageTimeRange');
    spectator.component.onTimeRangeSelected(selectedTimeRange);
    expect(spectator.component.savePageTimeRange).toHaveBeenCalled();

    expect(spectator.component.savePageTimeRange).toHaveBeenCalledWith(selectedTimeRange, {
      path: 'parent-path'
    });
  });
});

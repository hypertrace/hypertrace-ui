import { UrlSegment } from '@angular/router';
import {
  FeatureState,
  FeatureStateResolver,
  NavigationService,
  PageTimeRangePreferenceService,
  RelativeTimeRange,
  TimeDuration,
  TimeUnit
} from '@hypertrace/common';
import { FeatureConfigCheckModule, PageTimeRangeComponent, TimeRangeComponent } from '@hypertrace/components';
import { createHostFactory, mockProvider, SpectatorHost } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { of } from 'rxjs';

describe('Page time range component', () => {
  let spectator: SpectatorHost<PageTimeRangeComponent>;
  const route = {
    snapshot: {
      data: {
        shouldSavePageTimeRange: undefined
      }
    },
    pathFromRoot: { flatMap: jest.fn().mockReturnValue(['foo']) }
  };

  const createHost = createHostFactory({
    shallow: true,
    component: PageTimeRangeComponent,
    declarations: [MockComponent(TimeRangeComponent)],
    imports: [FeatureConfigCheckModule],
    providers: [
      mockProvider(NavigationService, {
        getCurrentActivatedRoute: jest.fn().mockReturnValue(route)
      }),
      mockProvider(PageTimeRangePreferenceService),
      mockProvider(FeatureStateResolver, {
        getCombinedFeatureState: () => of(FeatureState.Enabled)
      })
    ]
  });

  test('should not attempt to save time range when route does not have default range', () => {
    spectator = createHost(`<ht-page-time-range></ht-page-time-range>`);
    const timeRange = new RelativeTimeRange(new TimeDuration(2, TimeUnit.Hour));

    const timeRangeComponent = spectator.query(TimeRangeComponent);
    expect(timeRangeComponent).toExist();

    spyOn(spectator.component, 'savePageTimeRange');
    spectator.component.onTimeRangeSelected(timeRange);
    expect(spectator.component.savePageTimeRange).not.toHaveBeenCalled();
  });

  test('should not attempt to save time range when saving flag property is not set', () => {
    spectator = createHost(`<ht-page-time-range></ht-page-time-range>`, {
      providers: [
        mockProvider(NavigationService, {
          getCurrentActivatedRoute: jest.fn().mockReturnValue({
            snapshot: {
              data: {
                shouldSavePageTimeRange: undefined
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

  test('should save time range when route has truthy property shouldSavePageTimeRange', () => {
    spectator = createHost(`<ht-page-time-range></ht-page-time-range>`, {
      providers: [
        mockProvider(NavigationService, {
          getCurrentActivatedRoute: jest.fn().mockReturnValue({
            snapshot: {
              data: {
                shouldSavePageTimeRange: true
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

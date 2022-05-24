import {
  FeatureState,
  FeatureStateResolver,
  FixedTimeRange,
  NavigationService,
  RelativeTimeRange,
  TimeDuration,
  TimeRange,
  TimeRangeService,
  TimeUnit
} from '@hypertrace/common';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { PageTimeRangePreferenceService } from './page-time-range-preference.service';

describe('Page time range preference service', () => {
  const defaultPageTimeRange = new RelativeTimeRange(new TimeDuration(2, TimeUnit.Hour));
  const serviceFactory = createServiceFactory({
    service: PageTimeRangePreferenceService,
    providers: [
      mockProvider(NavigationService, {
        getRouteConfig: jest.fn().mockReturnValue({ data: { defaultTimeRange: defaultPageTimeRange } })
      }),
      mockProvider(FeatureStateResolver, {
        getFeatureState: jest.fn().mockReturnValue(of(FeatureState.Enabled))
      })
    ]
  });

  test('Setting fixed time range emits corresponding time range from preferences', () => {
    runFakeRxjs(({ expectObservable, cold }) => {
      const timeRange: TimeRange = new FixedTimeRange(new Date(1573255100253), new Date(1573255111159));
      const spectator = serviceFactory({
        providers: [
          mockProvider(TimeRangeService, {
            timeRangeFromUrlString: jest.fn().mockReturnValue(timeRange)
          })
        ]
      });

      cold('-a|', {
        a: () => spectator.service.setTimeRangePreferenceForPage('foo', timeRange)
      }).subscribe(update => update());

      const recordedTimeRanges$ = spectator.service
        .getTimeRangePreferenceForPage('foo')
        .pipe(map(timeRangeResolver => timeRangeResolver()));

      expectObservable(recordedTimeRanges$).toBe('da', {
        d: defaultPageTimeRange,
        a: timeRange
      });
    });
  });

  test('Setting relative time range emits corresponding time range from preferences', () => {
    runFakeRxjs(({ expectObservable, cold }) => {
      const timeRange = new RelativeTimeRange(new TimeDuration(1, TimeUnit.Hour));
      const spectator = serviceFactory({
        providers: [
          mockProvider(TimeRangeService, {
            timeRangeFromUrlString: jest.fn().mockReturnValue(timeRange)
          })
        ]
      });

      cold('-b|', {
        b: () => spectator.service.setTimeRangePreferenceForPage('bar', timeRange)
      }).subscribe(update => update());

      const recordedTimeRanges$ = spectator.service
        .getTimeRangePreferenceForPage('bar')
        .pipe(map(timeRangeResolver => timeRangeResolver()));

      expectObservable(recordedTimeRanges$).toBe('db', {
        d: defaultPageTimeRange,
        b: timeRange
      });
    });
  });
});

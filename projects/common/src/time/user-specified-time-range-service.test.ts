import {
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
import { UserSpecifiedTimeRangeService } from './user-specified-time-range.service';

describe('Page time range service', () => {
  const defaultPageTimeRange = new RelativeTimeRange(new TimeDuration(2, TimeUnit.Hour));
  const serviceFactory = createServiceFactory({
    service: UserSpecifiedTimeRangeService,
    providers: [
      mockProvider(NavigationService, {
        getRouteConfig: jest.fn().mockReturnValue({ data: { defaultTimeRange: defaultPageTimeRange } })
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
        a: () => spectator.service.setUserSpecifiedTimeRangeForPage('foo', timeRange)
      }).subscribe(update => update());

      expectObservable(spectator.service.getUserSpecifiedTimeRangeForPage('foo')).toBe('da', {
        d: defaultPageTimeRange,
        a: timeRange
      });
    });
  });

  test('Setting relative time range emits corresponding time range from preferences', () => {
    runFakeRxjs(({ expectObservable, cold }) => {
      const timeRange: TimeRange = new RelativeTimeRange(new TimeDuration(1, TimeUnit.Hour));
      const spectator = serviceFactory({
        providers: [
          mockProvider(TimeRangeService, {
            timeRangeFromUrlString: jest.fn().mockReturnValue(timeRange)
          })
        ]
      });

      cold('-b|', {
        b: () => spectator.service.setUserSpecifiedTimeRangeForPage('bar', timeRange)
      }).subscribe(update => update());

      expectObservable(spectator.service.getUserSpecifiedTimeRangeForPage('bar')).toBe('db', {
        d: defaultPageTimeRange,
        b: timeRange
      });
    });
  });
});

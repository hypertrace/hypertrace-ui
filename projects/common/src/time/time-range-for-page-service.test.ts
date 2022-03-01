import {
  FixedTimeRange,
  NavigationService,
  RelativeTimeRange,
  TimeDuration,
  TimeRange,
  TimeRangeForPageService,
  TimeRangeService,
  TimeUnit
} from '@hypertrace/common';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';

describe('Page time range service', () => {
  const defaultPageTimeRange = new RelativeTimeRange(new TimeDuration(2, TimeUnit.Hour));
  const serviceFactory = createServiceFactory({
    service: TimeRangeForPageService,
    providers: [mockProvider(NavigationService)]
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
      jest.spyOn(spectator.service, 'getDefaultPageTimeRange').mockImplementation(() => defaultPageTimeRange);

      cold('-a|', {
        a: () => spectator.service.setTimeRangeForCurrentPage('foo', timeRange)
      }).subscribe(update => update());

      expectObservable(spectator.service.getTimeRangeForCurrentPage('foo')).toBe('da', {
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
      jest.spyOn(spectator.service, 'getDefaultPageTimeRange').mockImplementation(() => defaultPageTimeRange);

      cold('-b|', {
        b: () => spectator.service.setTimeRangeForCurrentPage('bar', timeRange)
      }).subscribe(update => update());

      expectObservable(spectator.service.getTimeRangeForCurrentPage('bar')).toBe('db', {
        d: defaultPageTimeRange,
        b: timeRange
      });
    });
  });
});

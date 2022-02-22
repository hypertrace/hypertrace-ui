import { ActivatedRoute, convertToParamMap } from '@angular/router';
import {
  NavigationService,
  RelativeTimeRange,
  TimeDuration,
  TimeRange,
  TimeRangeService,
  TimeUnit
} from '@hypertrace/common';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { NEVER, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { FixedTimeRange } from './fixed-time-range';

interface NavMock {
  qpTime: string | undefined;
  defaultTimeRange: TimeRange | undefined;
}

describe('Time range service', () => {
  let relativeTimeRange = new RelativeTimeRange(new TimeDuration(1, TimeUnit.Hour));
  const firstMockRoute: NavMock = {
    qpTime: '1573255100253-1573255111159',
    defaultTimeRange: relativeTimeRange
  };
  const secondMockRoute: NavMock = {
    qpTime: undefined,
    defaultTimeRange: relativeTimeRange
  };
  const buildMockRoute = (navMock: NavMock): ActivatedRoute =>
    // tslint:disable-next-line: no-object-literal-type-assertion
    (({
      queryParamMap: of(convertToParamMap({ time: navMock.qpTime })),
      snapshot: { data: { defaultTimeRange: navMock.defaultTimeRange } }
    } as unknown) as ActivatedRoute);

  let timeRange$: Observable<string> = NEVER;
  const buildService = createServiceFactory({
    service: TimeRangeService,
    providers: [
      mockProvider(NavigationService, {
        get navigation$(): Observable<ActivatedRoute> {
          return timeRange$.pipe(
            map(
              initialTrString =>
                // tslint:disable-next-line: no-object-literal-type-assertion
                (({
                  queryParamMap: of(convertToParamMap({ time: initialTrString })),
                  snapshot: { data: { defaultTimeRange: new RelativeTimeRange(new TimeDuration(1, TimeUnit.Hour)) } }
                } as unknown) as ActivatedRoute)
            )
          );
        }
      })
    ]
  });

  test('throws error when asking for time range before initialization', () => {
    const spectator = buildService();
    expect(() => spectator.service.getCurrentTimeRange()).toThrow();
  });

  test('returns time range when requested after init', () => {
    timeRange$ = of('1573255100253-1573255111159');
    const spectator = buildService();
    expect(spectator.service.getCurrentTimeRange()).toEqual(
      new FixedTimeRange(new Date(1573255100253), new Date(1573255111159))
    );
  });

  test('returns observable that emits future time range changes including initialization', () => {
    const lateArrivingTimeRange = new FixedTimeRange(new Date(1573255111159), new Date(1573255111160));
    runFakeRxjs(({ cold, expectObservable }) => {
      timeRange$ = cold('1ms x', {
        x: '1573255100253-1573255111159'
      });

      const spectator = buildService();
      expect(() => spectator.service.getCurrentTimeRange()).toThrow();

      cold('5ms x').subscribe(() =>
        spectator.service.setFixedRange(lateArrivingTimeRange.startTime, lateArrivingTimeRange.endTime)
      );

      expectObservable(spectator.service.getTimeRangeAndChanges()).toBe('1ms x 3ms y', {
        x: new FixedTimeRange(new Date(1573255100253), new Date(1573255111159)),
        y: lateArrivingTimeRange
      });
    });
  });

  test('returns observable that emits current time range and later changes', () => {
    const lateArrivingTimeRange = new FixedTimeRange(new Date(1573255111159), new Date(1573255111160));
    runFakeRxjs(({ cold, expectObservable }) => {
      timeRange$ = of('1573255100253-1573255111159');

      const spectator = buildService();
      expect(spectator.service.getCurrentTimeRange()).toEqual(
        new FixedTimeRange(new Date(1573255100253), new Date(1573255111159))
      );
      cold('5ms x').subscribe(() =>
        spectator.service.setFixedRange(lateArrivingTimeRange.startTime, lateArrivingTimeRange.endTime)
      );

      expectObservable(spectator.service.getTimeRangeAndChanges()).toBe('x 4ms y', {
        x: new FixedTimeRange(new Date(1573255100253), new Date(1573255111159)),
        y: lateArrivingTimeRange
      });
    });
  });

  test('returns custom time filter', () => {
    const spectator = buildService();
    expect(spectator.service.toQueryParams(new Date(1642296703000), new Date(1642396703000))).toStrictEqual({
      ['time']: new FixedTimeRange(new Date(1642296703000), new Date(1642396703000)).toUrlString()
    });
  });

  test('Sets time range with navigation events', () => {
    relativeTimeRange = new RelativeTimeRange(new TimeDuration(1, TimeUnit.Hour));
    runFakeRxjs(({ cold, expectObservable }) => {
      const spectator = buildService({
        providers: [
          mockProvider(NavigationService, {
            get navigation$(): Observable<ActivatedRoute> {
              return cold('-a-b', {
                a: buildMockRoute(firstMockRoute),
                b: buildMockRoute(secondMockRoute)
              });
            }
          })
        ]
      });

      // First mock route gets emitted a second time but in same frame as second mock. Believe this is because
      // The buildMockRoute is using 'of' operator
      expectObservable(spectator.service.getTimeRangeAndChanges()).toBe('-a-(bc)', {
        a: new FixedTimeRange(new Date(1573255100253), new Date(1573255111159)),
        b: new FixedTimeRange(new Date(1573255100253), new Date(1573255111159)),
        c: secondMockRoute.defaultTimeRange
      });
    });
  });
});

import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { NEVER, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { NavigationService } from '../navigation/navigation.service';
import { FixedTimeRange } from './fixed-time-range';
import { TimeRangeService } from './time-range.service';

describe('Time range service', () => {
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
                ({
                  queryParamMap: of(convertToParamMap({ time: initialTrString }))
                } as ActivatedRoute)
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
      [TimeRangeService.TIME_RANGE_QUERY_PARAM]: new FixedTimeRange(
        new Date(1642296703000),
        new Date(1642396703000)
      ).toUrlString()
    });
  });
});

import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { runFakeRxjs } from '@hypertrace/test-utils';
import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { NEVER, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { NavigationService } from '../navigation/navigation.service';
import { FixedTimeRange } from './fixed-time-range';
import { TimeRangeService } from './time-range.service';
import { TimeUnit } from './time-unit.type';
import { TimeDuration } from './time-duration';

describe('Time range service', () => {
  let timeRange$: Observable<string | undefined> = NEVER;
  const buildService = createServiceFactory({
    service: TimeRangeService,
    providers: [
      mockProvider(NavigationService, {
        get navigation$(): Observable<ActivatedRoute> {
          return timeRange$.pipe(
            map(
              initialTrString =>
                ({
                  snapshot: { queryParamMap: convertToParamMap({ time: initialTrString }) }
                } as ActivatedRoute)
            )
          );
        },
        addQueryParametersToUrl: jest.fn()
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

  test('returns default time range when time param is missing', () => {
    timeRange$ = of(undefined);
    const spectator = buildService();
    expect(spectator.service.getCurrentTimeRange()).toEqual(
      expect.objectContaining({ duration: new TimeDuration(1, TimeUnit.Day) })
    );
  });

  test('returns default time range when time param is invalid', () => {
    timeRange$ = of('invalidTime');
    const spectator = buildService();
    expect(spectator.service.getCurrentTimeRange()).toEqual(
      expect.objectContaining({ duration: new TimeDuration(1, TimeUnit.Day) })
    );
  });

  test('returns observable that emits future time range changes including initialization', () => {
    const lateArrivingTimeRange = new FixedTimeRange(new Date(1573255111159), new Date(1573255111160));
    runFakeRxjs(({ cold, expectObservable }) => {
      timeRange$ = cold('1ms x 3ms y', {
        x: '1573255100253-1573255111159',
        y: lateArrivingTimeRange.toUrlString()
      });

      const spectator = buildService();
      expect(() => spectator.service.getCurrentTimeRange()).toThrow();

      expectObservable(spectator.service.getTimeRangeAndChanges()).toBe('1ms x 3ms y', {
        x: new FixedTimeRange(new Date(1573255100253), new Date(1573255111159)),
        y: lateArrivingTimeRange
      });
    });
  });

  test('returns observable that emits current time range', () => {
    runFakeRxjs(() => {
      timeRange$ = of('1573255100253-1573255111159');

      const spectator = buildService();
      expect(spectator.service.getCurrentTimeRange()).toEqual(
        new FixedTimeRange(new Date(1573255100253), new Date(1573255111159))
      );
    });
  });

  test('returns observable that emits later changes', () => {
    const lateArrivingTimeRange = new FixedTimeRange(new Date(1573255111159), new Date(1573255111160));

    runFakeRxjs(({ cold, expectObservable }) => {
      timeRange$ = cold('x 5ms y', {
        x: '1573255100253-1573255111159',
        y: lateArrivingTimeRange.toUrlString()
      });

      const spectator = buildService();
      expect(() => spectator.service.getCurrentTimeRange()).toThrow();

      expectObservable(spectator.service.getTimeRangeAndChanges()).toBe('x 5ms y', {
        x: new FixedTimeRange(new Date(1573255100253), new Date(1573255111159)),
        y: lateArrivingTimeRange
      });
    });
  });

  test('set methods should call navigation service methods', () => {
    const fixedRange = new FixedTimeRange(new Date(1573255111159), new Date(1573255111160));

    const spectator = buildService();
    spectator.service.setFixedRange(fixedRange.startTime, fixedRange.endTime);
    expect(spectator.inject(NavigationService).addQueryParametersToUrl).toHaveBeenLastCalledWith({
      ['time']: fixedRange.toUrlString()
    });

    spectator.service.setRelativeRange(1, TimeUnit.Hour);
    expect(spectator.inject(NavigationService).addQueryParametersToUrl).toHaveBeenLastCalledWith({
      ['time']: '1h'
    });
  });

  test('returns custom time filter', () => {
    const spectator = buildService();
    const timeRange = new FixedTimeRange(new Date(1642296703000), new Date(1642396703000));
    expect(spectator.service.toQueryParams(timeRange)).toStrictEqual({
      ['time']: timeRange.toUrlString()
    });
  });
});

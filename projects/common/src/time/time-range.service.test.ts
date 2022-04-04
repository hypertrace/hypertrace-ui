import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { recordObservable, runFakeRxjs } from '@hypertrace/test-utils';
import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { NEVER, Observable, of, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { NavigationService, QueryParamObject } from '../navigation/navigation.service';
import { FixedTimeRange } from './fixed-time-range';
import { TimeRangeService } from './time-range.service';

describe('Time range(TR) service', () => {
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
                  queryParamMap: of(convertToParamMap({ time: initialTrString, refresh: 'true' })),
                  snapshot: { queryParamMap: convertToParamMap({ time: initialTrString, refresh: 'true' }) }
                } as unknown) as ActivatedRoute)
            )
          );
        },
        getQueryParameter: jest
          .fn()
          .mockReturnValueOnce('1573255100253-1573255111159')
          .mockReturnValue('1573255111159-1573455111990'),
        getCurrentActivatedRoute: () =>
          (({ snapshot: { queryParams: { time: 'test-value' } } } as unknown) as ActivatedRoute)
      })
    ]
  });

  test('throws error when asking for time range before initialization', () => {
    const spectator = buildService();
    expect(() => spectator.service.getCurrentTimeRange()).toThrow();
  });

  test('returns time range when requested after init', () => {
    runFakeRxjs(({ cold, expectObservable }) => {
      timeRange$ = cold('x|', {
        x: '1573255100253-1573255111159'
      });

      const spectator = buildService();

      expect(() => spectator.service.getCurrentTimeRange()).toThrow();

      expectObservable(spectator.service.getTimeRangeAndChanges()).toBe('x', {
        x: new FixedTimeRange(new Date(1573255100253), new Date(1573255111159))
      });
    });
  });

  test('returns observable that emits future time range changes including initialization', () => {
    const firstArrivingTimeRange = new FixedTimeRange(new Date(1573255100253), new Date(1573255111159));
    const secondArrivingTimeRange = new FixedTimeRange(new Date(1573255111159), new Date(1573455111990));

    runFakeRxjs(({ cold, expectObservable }) => {
      const spectator = buildService({
        providers: [
          mockProvider(NavigationService, {
            navigation$: cold('-x---y', {
              x: ({
                queryParamMap: of(convertToParamMap({ time: firstArrivingTimeRange.toUrlString(), refresh: 'true' })),
                snapshot: {
                  queryParamMap: convertToParamMap({ time: firstArrivingTimeRange.toUrlString(), refresh: 'true' })
                }
              } as unknown) as ActivatedRoute,
              y: ({
                queryParamMap: of(convertToParamMap({ time: secondArrivingTimeRange.toUrlString(), refresh: 'true' })),
                snapshot: {
                  queryParamMap: convertToParamMap({ time: secondArrivingTimeRange.toUrlString(), refresh: 'true' })
                }
              } as unknown) as ActivatedRoute
            }),
            getQueryParameter: jest
              .fn()
              .mockReturnValueOnce(firstArrivingTimeRange.toUrlString())
              .mockReturnValue(secondArrivingTimeRange.toUrlString()),
            getCurrentActivatedRoute: () =>
              (({ snapshot: { queryParams: { time: 'test-value' } } } as unknown) as ActivatedRoute)
          })
        ]
      });

      const recordedTimeRanges = recordObservable(spectator.service.getTimeRangeAndChanges());

      expect(() => spectator.service.getCurrentTimeRange()).toThrow();

      expectObservable(recordedTimeRanges).toBe('-x----y', {
        x: new FixedTimeRange(new Date(1573255100253), new Date(1573255111159)),
        y: secondArrivingTimeRange
      });
    });
  });

  test('Emits default TR when set, then subsequent first and second TRs from query param changes', () => {
    const defaultTimeRange = new FixedTimeRange(new Date(1573277100277), new Date(1573277100277));
    const firstArrivingTimeRange = new FixedTimeRange(new Date(1573255100253), new Date(1573255111159));
    const secondArrivingTimeRange = new FixedTimeRange(new Date(1573255111159), new Date(1573455111990));
    const mockNavigation$ = new Subject();
    runFakeRxjs(({ expectObservable, cold }) => {
      const spectator = buildService({
        providers: [
          mockProvider(NavigationService, {
            navigation$: mockNavigation$.asObservable().pipe(
              map(
                timeRangeString =>
                  (({
                    queryParamMap: of(convertToParamMap({ time: timeRangeString, refresh: 'true' })),
                    snapshot: {
                      queryParamMap: convertToParamMap({ time: timeRangeString, refresh: 'true' })
                    }
                  } as unknown) as ActivatedRoute)
              )
            ),
            addQueryParametersToUrl: (newParams: QueryParamObject) => mockNavigation$.next(newParams.time as string),
            getQueryParameter: jest
              .fn()
              .mockReturnValueOnce('1573277100277-1573277100277')
              .mockReturnValueOnce('1573255100253-1573255111159')
              .mockReturnValue('1573255111159-1573455111990'),
            getCurrentActivatedRoute: () =>
              (({ snapshot: { queryParams: { time: 'test-value' } } } as unknown) as ActivatedRoute),
            replaceQueryParametersInUrl: jest.fn()
          })
        ]
      });

      cold('x').subscribe(() => spectator.service.setDefaultTimeRange(defaultTimeRange));

      cold('2ms y').subscribe(() =>
        spectator.service.setFixedRange(firstArrivingTimeRange.startTime, firstArrivingTimeRange.endTime)
      );

      cold('5ms z').subscribe(() =>
        spectator.service.setFixedRange(secondArrivingTimeRange.startTime, secondArrivingTimeRange.endTime)
      );

      expectObservable(spectator.service.getTimeRangeAndChanges()).toBe('x 1ms y 2ms z', {
        x: defaultTimeRange,
        y: firstArrivingTimeRange,
        z: secondArrivingTimeRange
      });
    });
  });

  test('returns custom time filter', () => {
    const spectator = buildService();
    expect(
      spectator.service.toQueryParams(new FixedTimeRange(new Date(1642296703000), new Date(1642396703000)))
    ).toStrictEqual({
      ['time']: new FixedTimeRange(new Date(1642296703000), new Date(1642396703000)).toUrlString()
    });
  });
});

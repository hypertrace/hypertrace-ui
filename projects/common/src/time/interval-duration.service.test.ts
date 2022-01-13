import { runFakeRxjs } from '@hypertrace/test-utils';
import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { EMPTY } from 'rxjs';
import { FixedTimeRange } from './fixed-time-range';
import { IntervalDurationService } from './interval-duration.service';
import { RelativeTimeRange } from './relative-time-range';
import { TimeDuration } from './time-duration';
import { TimeRangeService } from './time-range.service';
import { TimeUnit } from './time-unit.type';

describe('Interval duration service', () => {
  const serviceBuilder = createServiceFactory({
    service: IntervalDurationService,
    providers: [
      mockProvider(TimeRangeService, {
        getTimeRangeAndChanges: () => EMPTY
      })
    ]
  });

  test('emits available intervals whenever time range changes', () => {
    runFakeRxjs(({ expectObservable, cold }) => {
      const marblePattern = 'x-y--z';
      const spectator = serviceBuilder({
        providers: [
          mockProvider(TimeRangeService, {
            getTimeRangeAndChanges: () =>
              cold(marblePattern, {
                x: new RelativeTimeRange(new TimeDuration(15, TimeUnit.Minute)),
                y: new RelativeTimeRange(new TimeDuration(6, TimeUnit.Hour)),
                z: new FixedTimeRange(new Date('2019-09-19T16:40:45.141Z'), new Date('2019-09-21T16:40:45.141Z'))
              })
          })
        ]
      });

      expectObservable(spectator.service.availableIntervals$).toBe(marblePattern, {
        x: [
          new TimeDuration(15, TimeUnit.Second),
          new TimeDuration(30, TimeUnit.Second),
          new TimeDuration(1, TimeUnit.Minute),
          new TimeDuration(5, TimeUnit.Minute)
        ],
        y: [
          new TimeDuration(1, TimeUnit.Minute),
          new TimeDuration(5, TimeUnit.Minute),
          new TimeDuration(15, TimeUnit.Minute),
          new TimeDuration(30, TimeUnit.Minute),
          new TimeDuration(1, TimeUnit.Hour)
        ],
        z: [
          new TimeDuration(15, TimeUnit.Minute),
          new TimeDuration(30, TimeUnit.Minute),
          new TimeDuration(1, TimeUnit.Hour),
          new TimeDuration(6, TimeUnit.Hour),
          new TimeDuration(12, TimeUnit.Hour)
        ]
      });
    });
  });

  test('does not emit available intervals if new TR supports same intervals as previous', () => {
    runFakeRxjs(({ expectObservable, cold }) => {
      const spectator = serviceBuilder({
        providers: [
          mockProvider(TimeRangeService, {
            getTimeRangeAndChanges: () =>
              cold('x-y', {
                x: new RelativeTimeRange(new TimeDuration(15, TimeUnit.Minute)),
                y: new FixedTimeRange(new Date('2019-09-19T16:40:45.141Z'), new Date('2019-09-19T16:55:45.141Z'))
              })
          })
        ]
      });

      expectObservable(spectator.service.availableIntervals$).toBe('x--', {
        x: [
          new TimeDuration(15, TimeUnit.Second),
          new TimeDuration(30, TimeUnit.Second),
          new TimeDuration(1, TimeUnit.Minute),
          new TimeDuration(5, TimeUnit.Minute)
        ]
      });
    });
  });

  test('provides available intervals for an arbitrary time range', () => {
    const spectator = serviceBuilder();

    expect(
      spectator.service.getAvailableIntervalsForTimeRange(
        new FixedTimeRange(new Date('2019-09-19T16:40:45.141Z'), new Date('2019-09-21T16:40:45.141Z'))
      )
    ).toEqual([
      new TimeDuration(15, TimeUnit.Minute),
      new TimeDuration(30, TimeUnit.Minute),
      new TimeDuration(1, TimeUnit.Hour),
      new TimeDuration(6, TimeUnit.Hour),
      new TimeDuration(12, TimeUnit.Hour)
    ]);
  });

  test('provides available intervals for an arbitrary time range based on maximum data points', () => {
    const spectator = serviceBuilder();

    expect(
      spectator.service.getAvailableIntervalsForTimeRange(
        new FixedTimeRange(new Date('2019-09-19T16:40:45.141Z'), new Date('2019-09-21T16:40:45.141Z')),
        100
      )
    ).toEqual([
      new TimeDuration(30, TimeUnit.Minute),
      new TimeDuration(1, TimeUnit.Hour),
      new TimeDuration(6, TimeUnit.Hour),
      new TimeDuration(12, TimeUnit.Hour)
    ]);
  });

  test('calculates the closest match to an interval from a list', () => {
    const spectator = serviceBuilder();

    expect(
      spectator.service.getClosestMatch(new TimeDuration(5, TimeUnit.Minute), [
        new TimeDuration(15, TimeUnit.Minute),
        new TimeDuration(30, TimeUnit.Minute),
        new TimeDuration(1, TimeUnit.Hour),
        new TimeDuration(6, TimeUnit.Hour),
        new TimeDuration(12, TimeUnit.Hour)
      ])
    ).toEqual(new TimeDuration(15, TimeUnit.Minute));

    expect(
      spectator.service.getClosestMatch(new TimeDuration(5, TimeUnit.Month), [
        new TimeDuration(15, TimeUnit.Minute),
        new TimeDuration(30, TimeUnit.Minute),
        new TimeDuration(1, TimeUnit.Hour),
        new TimeDuration(6, TimeUnit.Hour),
        new TimeDuration(12, TimeUnit.Hour)
      ])
    ).toEqual(new TimeDuration(12, TimeUnit.Hour));
  });

  test('calculates the exact match (or undefined if none) of an interval from a list', () => {
    const spectator = serviceBuilder();

    expect(
      spectator.service.getExactMatch(new TimeDuration(30, TimeUnit.Minute), [
        new TimeDuration(15, TimeUnit.Minute),
        new TimeDuration(30, TimeUnit.Minute),
        new TimeDuration(1, TimeUnit.Hour),
        new TimeDuration(6, TimeUnit.Hour),
        new TimeDuration(12, TimeUnit.Hour)
      ])
    ).toEqual(new TimeDuration(30, TimeUnit.Minute));

    expect(
      spectator.service.getExactMatch(new TimeDuration(29, TimeUnit.Minute), [
        new TimeDuration(15, TimeUnit.Minute),
        new TimeDuration(30, TimeUnit.Minute),
        new TimeDuration(1, TimeUnit.Hour),
        new TimeDuration(6, TimeUnit.Hour),
        new TimeDuration(12, TimeUnit.Hour)
      ])
    ).toBeUndefined();
  });

  test('provides the value of the auto duration for an arbitrary time range', () => {
    const spectator = serviceBuilder();
    expect(
      spectator.service.getAutoDuration(
        new FixedTimeRange(new Date('2019-09-19T16:40:45.141Z'), new Date('2019-09-21T16:40:45.141Z'))
      )
    ).toEqual(new TimeDuration(12, TimeUnit.Hour)); // Smallest in range
  });

  test('provides the value of the auto duration for an arbitrary time range with provided maximum data points', () => {
    const spectator = serviceBuilder();
    expect(
      spectator.service.getAutoDuration(
        new FixedTimeRange(new Date('2019-09-19T16:40:45.141Z'), new Date('2019-09-21T16:40:45.141Z')),
        100
      )
    ).toEqual(new TimeDuration(12, TimeUnit.Hour)); // Smallest in range
  });

  test('calculates the exact match (or undefined if none) of an interval from a list', () => {
    const spectator = serviceBuilder();

    expect(
      spectator.service.getAutoDurationFromTimeDurations([
        new TimeDuration(15, TimeUnit.Minute),
        new TimeDuration(30, TimeUnit.Minute),
        new TimeDuration(1, TimeUnit.Hour),
        new TimeDuration(6, TimeUnit.Hour),
        new TimeDuration(12, TimeUnit.Hour)
      ])
    ).toEqual(new TimeDuration(12, TimeUnit.Hour));
  });
});

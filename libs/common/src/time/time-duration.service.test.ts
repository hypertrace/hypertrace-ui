import { createServiceFactory } from '@ngneat/spectator/jest';
import { FixedTimeRange } from './fixed-time-range';
import { TimeDuration } from './time-duration';
import { TimeDurationService } from './time-duration.service';
import { TimeUnit } from './time-unit.type';

describe('Time duration service', () => {
  const serviceBuilder = createServiceFactory({
    service: TimeDurationService
  });

  test('can convert a time range into a duration', () => {
    const start = Date.now();
    const spectator = serviceBuilder();
    expect(spectator.service.getTimeRangeDuration(new FixedTimeRange(new Date(start), new Date(start + 130)))).toEqual(
      new TimeDuration(130, TimeUnit.Millisecond)
    );
  });

  test('can calculate the millis in a time range', () => {
    const start = Date.now();
    const spectator = serviceBuilder();
    expect(
      spectator.service.getTimeRangeDurationMillis(new FixedTimeRange(new Date(start), new Date(start + 130)))
    ).toEqual(130);
  });

  test('can parse a duration string', () => {
    const spectator = serviceBuilder();
    expect(spectator.service.durationFromString('130ms')).toEqual(new TimeDuration(130, TimeUnit.Millisecond));
  });
});

import { RelativeTimeRange } from './relative-time-range';
import { TimeDuration } from './time-duration';
import { TimeUnit } from './time-unit.type';

describe('RelativeTimeRange', () => {
  const component = new RelativeTimeRange(new TimeDuration(1, TimeUnit.Hour));

  test('sets seconds & milliseconds to zero by default', () => {
    expect(component.startTime.getSeconds()).toBe(0);
    expect(component.startTime.getMilliseconds()).toBe(0);
    expect(component.endTime.getSeconds()).toBe(0);
    expect(component.endTime.getMilliseconds()).toBe(0);
  });
});

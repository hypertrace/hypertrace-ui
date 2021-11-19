import { TimeUnit } from '@hypertrace/common';
import { getDurationFromTimeRange, getPreviousTimeRange, GraphQlTimeRange } from '@hypertrace/observability';

describe('Time Range Util', () => {
  const oneHourRange = new GraphQlTimeRange( new Date(1637298000000), new Date(1637301600000));
  const twoHourRange = new GraphQlTimeRange( new Date(1637294400000), new Date(1637301600000));
  test('computes previous time window as expected', () => {
    const previousTimeRange = getPreviousTimeRange(oneHourRange);
    expect(new Date(previousTimeRange.from).getTime()).toEqual(1637294400000);
    expect(new Date(previousTimeRange.to).getTime()).toEqual(1637298000000);
  });

  test('computes time duration from time range as expected', () => {
    expect(getDurationFromTimeRange(oneHourRange).getAmountForUnit(TimeUnit.Hour)).toBe(1);
    expect(getDurationFromTimeRange(twoHourRange).getAmountForUnit(TimeUnit.Hour)).toBe(2);
  });
})

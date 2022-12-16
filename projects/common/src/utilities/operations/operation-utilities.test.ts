import { getDifferenceInDays } from './operation-utilities';

describe('get difference in days', () => {
  it('should return no. of days from start date till current date', () => {
    const result = getDifferenceInDays('1671069000000-1671159000000');
    expect(result).toBe(1);
  });

  it('should return 0 if current date and start date is on the same day', () => {
    const result = getDifferenceInDays('1671155400000-1671159000000');
    expect(result).toBe(0);
  });

  it('should return undefined for null/undefined timeParamValue', () => {
    const result = getDifferenceInDays(undefined);
    expect(result).toBeUndefined();
  });
});

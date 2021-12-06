import { Injectable } from '@angular/core';
import { TimeDuration } from './time-duration';
import { TimeRange } from './time-range';
import { TimeUnit } from './time-unit.type';

@Injectable({
  providedIn: 'root'
})
export class TimeDurationService {
  private readonly durationRegex: RegExp = /(\d+)(\w+)/;

  public getTimeRangeDuration(timeRange: Pick<TimeRange, 'startTime' | 'endTime'>): TimeDuration {
    return new TimeDuration(timeRange.endTime.getTime() - timeRange.startTime.getTime(), TimeUnit.Millisecond);
  }

  public getTimeRangeDurationMillis(timeRange: Pick<TimeRange, 'startTime' | 'endTime'>): number {
    return this.getTimeRangeDuration(timeRange).toMillis();
  }

  public durationFromString(durationString: string): undefined | TimeDuration {
    const captures = this.durationRegex.exec(durationString);
    if (!captures || captures.length !== 3) {
      return undefined;
    }

    try {
      const durationValue = parseInt(captures[1]);
      const durationUnit = captures[2];
      if (TimeDurationService.isValidUnit(durationUnit)) {
        return new TimeDuration(durationValue, durationUnit);
      }
    } catch (e) {
      /*NOOP*/
    }

    return undefined;
  }

  private static isValidUnit(unitString: string): unitString is TimeUnit {
    try {
      // Instantiating TimeDuration should throw if the unitString does not map to a valid TimeUnit
      // tslint:disable-next-line:no-unused-expression
      new TimeDuration(1, unitString as TimeUnit);
    } catch (e) {
      return false;
    }

    return true;
  }
}

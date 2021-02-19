import { Pipe, PipeTransform } from '@angular/core';
import { TimeDuration } from '../../../time/time-duration';
import { TimeUnit } from '../../../time/time-unit.type';
import { DateCoercer } from '../../coercers/date-coercer';

@Pipe({
  name: 'htDisplayTimeAgo'
})
export class DisplayTimeAgo implements PipeTransform {
  private readonly dateCoercer: DateCoercer = new DateCoercer();

  public transform(value?: DateOrMillis | null): string {
    if (value === null || value === undefined) {
      return '-';
    }

    return new TimeDuration(this.calcSecondsAgo(value), TimeUnit.Second).toTimeAgoString();
  }

  private calcSecondsAgo(timestamp: DateOrMillis): number {
    return Math.floor((Date.now() - this.dateCoercer.coerce(timestamp)!.getTime()) / 1000);
  }
}

type DateOrMillis = Date | number;

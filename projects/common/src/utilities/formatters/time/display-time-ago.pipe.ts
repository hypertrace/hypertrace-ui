import { Pipe, PipeTransform } from '@angular/core';
import { TimeDuration } from '../../../time/time-duration';
import { TimeUnit } from '../../../time/time-unit.type';
import { DateCoercer } from '../../coercers/date-coercer';

@Pipe({
  name: 'htDisplayTimeAgo'
})
/*
 * WARNING: This pipe is configured as pure, but this could lead to it not updating on change detection.
 *  This limitation is fine for the current use case of cell renderers, which update with refresh anyway.
 *  If this pipe is used somewhere that the value would require dynamically changing while the component
 *  itself is not recreated, this will cause a bug.
 */
export class DisplayTimeAgo implements PipeTransform {
  private readonly dateCoercer: DateCoercer = new DateCoercer();

  public transform(value?: DateOrMillis | null): string {
    if (value === null || value === undefined || value === 0) {
      return '-';
    }

    const durationAgo = new TimeDuration(this.calcSecondsAgo(value), TimeUnit.Second);
    if (durationAgo.getAmountForUnit(TimeUnit.Minute) < 1) {
      return 'Just now';
    }

    return `${durationAgo.getMostSignificantUnitOnly().toLongString()} ago`;
  }

  private calcSecondsAgo(timestamp: DateOrMillis): number {
    return Math.floor((Date.now() - this.dateCoercer.coerce(timestamp)!.getTime()) / 1000);
  }
}

type DateOrMillis = Date | number;

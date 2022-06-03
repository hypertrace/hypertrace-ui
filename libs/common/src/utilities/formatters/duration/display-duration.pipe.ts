import { Pipe, PipeTransform } from '@angular/core';
import { TimeDuration, UnitStringType } from '../../../time/time-duration';
import { TimeUnit } from '../../../time/time-unit.type';
import { durationFormatter } from './duration-formatter';

@Pipe({
  name: 'htDisplayDuration'
})
export class DisplayDurationPipe implements PipeTransform {
  public transform(millis?: number, unitStringType: UnitStringType = UnitStringType.Short): string {
    if (millis === undefined) {
      return '-';
    }

    if (unitStringType === UnitStringType.Short) {
      return durationFormatter(millis);
    }

    return new TimeDuration(millis, TimeUnit.Millisecond).toMultiUnitString(TimeUnit.Second, true, UnitStringType.Long);
  }
}

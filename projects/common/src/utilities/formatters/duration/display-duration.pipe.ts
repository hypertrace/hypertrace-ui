import { Pipe, PipeTransform } from '@angular/core';
import { TimeUnit } from 'projects/common/src/public-api';
import { TimeDuration, UnitStringType } from 'projects/common/src/time/time-duration';


@Pipe({
  name: 'htDisplayDuration'
})
export class DisplayDurationPipe implements PipeTransform {
  public transform(millis?: number, unitStringType: UnitStringType = UnitStringType.Short): string {
    if(millis === undefined)
    return '-';

    if(unitStringType === UnitStringType.Short)
    return new TimeDuration(millis!, TimeUnit.Millisecond).toString();

    return new TimeDuration(millis!, TimeUnit.Millisecond).toMultiUnitString();
  }
}

import { Pipe, PipeTransform } from '@angular/core';
import { TimeUnit } from './../../../public-api';
import { TimeDuration, UnitStringType } from './../../../public-api';


@Pipe({
  name: 'htDisplayDuration'
})
export class DisplayDurationPipe implements PipeTransform {
  public transform(millis?: number, unitStringType: UnitStringType = UnitStringType.Short): string {
    if(millis === undefined)
    return '-';

    if(unitStringType === UnitStringType.Short)
    return new TimeDuration(millis!, TimeUnit.Millisecond).toString();

    return new TimeDuration(millis!, TimeUnit.Millisecond).toMultiUnitString(TimeUnit.Second, true, UnitStringType.Long);
  }
}

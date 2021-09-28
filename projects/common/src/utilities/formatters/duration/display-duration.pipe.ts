import { Pipe, PipeTransform } from '@angular/core';
import { isNil } from 'lodash-es';
import { defaultDurationFormatOptions, DurationFormatOptions, durationFormatter } from './duration-formatter';

@Pipe({
  name: 'htDisplayDuration'
})
export class DisplayDurationPipe implements PipeTransform {
  public transform(millis?: number, options: DurationFormatOptions = defaultDurationFormatOptions): string {
    return isNil(millis) ? '-' : durationFormatter(millis, options);
  }
}

import { Pipe, PipeTransform } from '@angular/core';
import { durationFormatter } from './duration-formatter';

@Pipe({
  name: 'htcDisplayDuration'
})
export class DisplayDurationPipe implements PipeTransform {
  public transform(millis?: number): string {
    return durationFormatter(millis);
  }
}

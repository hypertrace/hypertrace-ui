import { Pipe, PipeTransform } from '@angular/core';
import { isNil } from 'lodash-es';
import { DateFormatOptions, DateFormatter } from './date-formatter';

@Pipe({
  name: 'htDisplayDate'
})
export class DisplayDatePipe implements PipeTransform {
  public transform(value?: string | Date | number | null, options: DateFormatOptions = {}): string {
    return isNil(value) ? '-' : new DateFormatter(options).format(value);
  }
}

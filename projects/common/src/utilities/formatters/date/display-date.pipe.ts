import { Pipe, PipeTransform } from '@angular/core';
import { DateFormatOptions, DateFormatter } from './date-formatter';

@Pipe({
  name: 'htDisplayDate'
})
export class DisplayDatePipe implements PipeTransform {
  public transform(value?: Date | number | null, options: DateFormatOptions = {}): string {
    return value !== null ? new DateFormatter(options).format(value) : '-';
  }
}

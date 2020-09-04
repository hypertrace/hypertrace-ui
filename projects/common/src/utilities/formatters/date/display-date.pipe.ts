import { Pipe, PipeTransform } from '@angular/core';
import { DateFormatOptions, DateFormatter } from './date-formatter';

@Pipe({
  name: 'htDisplayDate'
})
export class DisplayDatePipe implements PipeTransform {
  public transform(value?: Date | number, options: DateFormatOptions = {}): string {
    return new DateFormatter(options).format(value);
  }
}

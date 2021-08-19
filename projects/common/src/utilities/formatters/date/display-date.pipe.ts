import { Pipe, PipeTransform } from '@angular/core';
import { isNil } from 'lodash-es';
import { DateCoercer } from '../../coercers/date-coercer';
import { DateFormatOptions, DateFormatter } from './date-formatter';

@Pipe({
  name: 'htDisplayDate'
})
export class DisplayDatePipe implements PipeTransform {
  private readonly dateCoercer: DateCoercer = new DateCoercer();
  public transform(value?: string | Date | number | null, options: DateFormatOptions = {}): string {
    return isNil(value) ? '-' : new DateFormatter(options).format(this.dateCoercer.coerce(value));
  }
}

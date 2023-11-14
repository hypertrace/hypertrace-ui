import { Pipe, PipeTransform } from '@angular/core';
import { displayString } from './string-formatter';

@Pipe({
  name: 'htDisplayString',
})
export class DisplayStringPipe implements PipeTransform {
  public transform(value: unknown, defaultValueOnEmpty: string = '-'): string {
    return displayString(value, defaultValueOnEmpty);
  }
}

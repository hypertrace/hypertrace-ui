import { Pipe, PipeTransform } from '@angular/core';
import { OrdinalFormatter } from './ordinal-formatter';

@Pipe({
  name: 'htOrdinal'
})
export class OrdinalPipe implements PipeTransform {
  transform(value: number) {
    return new OrdinalFormatter().format(value);
  }
}

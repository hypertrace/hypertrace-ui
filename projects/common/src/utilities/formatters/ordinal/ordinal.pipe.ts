import { Pipe, PipeTransform } from '@angular/core';
import { OrdinalFormatter } from './ordinal-formatter';

@Pipe({
  name: 'htOrdinal'
})
export class OrdinalPipe implements PipeTransform {
  public transform(value: number): string {
    return new OrdinalFormatter().format(value);
  }
}

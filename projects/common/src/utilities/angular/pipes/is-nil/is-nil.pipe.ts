import { Pipe, PipeTransform } from '@angular/core';
import { isNil } from 'lodash-es';

@Pipe({
  name: 'htIsNil'
})
export class IsNilPipe implements PipeTransform {
  public transform(value: unknown): boolean {
    return isNil(value);
  }
}

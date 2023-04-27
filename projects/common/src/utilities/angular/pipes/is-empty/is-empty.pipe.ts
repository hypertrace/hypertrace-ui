import { Pipe, PipeTransform } from '@angular/core';
import { isEmpty } from 'lodash-es';

@Pipe({
  name: 'htIsEmpty'
})
export class IsEmptyPipe implements PipeTransform {
  public transform(value: unknown): boolean {
    return isEmpty(value);
  }
}

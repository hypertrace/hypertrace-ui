import { Pipe, PipeTransform } from '@angular/core';
import { displayStringEnum } from './display-string-enum';

@Pipe({
  name: 'htDisplayEnum'
})
export class DisplayStringEnumPipe implements PipeTransform {
  public transform(value: string): string {
    return displayStringEnum(value);
  }
}

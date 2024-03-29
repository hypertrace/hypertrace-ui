import { Pipe, PipeTransform } from '@angular/core';
import { displayStringEnum } from './display-string-enum';

@Pipe({
  name: 'htDisplayStringEnum',
})
export class DisplayStringEnumPipe implements PipeTransform {
  public transform(value?: string, defaultValue: string = '-', separator: string = ' '): string {
    return displayStringEnum(value, defaultValue, separator);
  }
}

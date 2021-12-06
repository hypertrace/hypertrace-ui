import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'htDisplayTitle'
})
export class DisplayTitlePipe implements PipeTransform {
  public transform(displayName: string = '', units: string = ''): string {
    const hasText = displayName !== '';
    const hasUnits = units !== '';

    if (hasText && hasUnits) {
      return `${displayName.toUpperCase()} (${units})`;
    }

    if (hasText) {
      return displayName.toUpperCase();
    }

    return units;
  }
}

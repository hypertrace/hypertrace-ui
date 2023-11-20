import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'htDisplayFileSize',
})
export class DisplayFileSizePipe implements PipeTransform {
  public transform(sizeInBytes: number): string {
    let power = Math.round(Math.log(sizeInBytes) / Math.log(1024));
    power = Math.min(power, FILE_SIZE_UNITS.length - 1);

    const size = sizeInBytes / Math.pow(1024, power);
    const formattedSize = Math.round(size * 100) / 100; // Formatting the size to 2 decimals
    const unit = FILE_SIZE_UNITS[power];

    return `${formattedSize} ${unit}`;
  }
}

const FILE_SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

import { Pipe, PipeTransform } from '@angular/core';
import { isNil } from 'lodash-es';
import { SupportedFileType, SUPPORTED_FILE_TYPE_METADATA_MAP } from '../file-types';

@Pipe({
  name: 'htFilePipe',
})
export class FileTypePipe implements PipeTransform {
  public transform(value: SupportedFileType | SupportedFileType[]): string {
    if (Array.isArray(value)) {
      return value.map(fileType => this.getFileExtension(fileType)).join(', ');
    }

    return this.getFileExtension(value);
  }

  private getFileExtension(supportedFileType: SupportedFileType): string {
    const data = SUPPORTED_FILE_TYPE_METADATA_MAP.get(supportedFileType);

    return !isNil(data) ? data.extension[0] : 'Unknown';
  }
}

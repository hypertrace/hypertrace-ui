import { Pipe, PipeTransform } from '@angular/core';
import { displayString } from '@hypertrace/common';
import { isNil } from 'lodash-es';

@Pipe({
  name: 'htStatusDisplayText'
})
export class StatusDisplayTextPipe implements PipeTransform {
  /**
   * Appends the `statusMessage` with a `-` if it's available.
   * If not just show the `statusCode`
   *
   * @param statusCode - status code
   * @param statusMessage - status message
   */
  public transform(statusCode: string | number, statusMessage?: string): string {
    let statusDisplayText = displayString(statusCode);
    if (!isNil(statusMessage) && statusMessage !== 'null') {
      statusDisplayText = `${statusDisplayText} - ${statusMessage}`;
    }

    return statusDisplayText;
  }
}

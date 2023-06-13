import { Pipe, PipeTransform } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';

@Pipe({
  name: 'htStatusDisplayIcon'
})
export class StatusDisplayIconPipe implements PipeTransform {
  public transform(statusCode: string | number, status?: string): IconType | undefined {
    if (status === 'FAIL') {
      return IconType.AlertFill;
    }
    if (status === 'SUCCESS') {
      return IconType.CheckCircleFill;
    }
    /**
     * GRPC Success -> 0
     * HTTP Success -> 100-300
     */
    if (+statusCode === 0 || (+statusCode >= 100 && +statusCode <= 399)) {
      return IconType.CheckCircleFill;
    }

    return IconType.AlertFill;
  }
}

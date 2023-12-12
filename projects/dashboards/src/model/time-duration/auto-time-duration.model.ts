import { Model } from '@hypertrace/hyperdash';
import { IntervalValue } from '@hypertrace/observability';

@Model({
  type: 'auto-time-duration',
})
export class AutoTimeDurationModel {
  public getDuration(): IntervalValue {
    return 'AUTO';
  }
}

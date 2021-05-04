import { Dictionary } from '@hypertrace/common';
import { Model, ModelProperty, PLAIN_OBJECT_PROPERTY } from '@hypertrace/hyperdash';
import { Observable, of } from 'rxjs';
import { GraphQlDataSourceModel } from '../../../data/graphql/graphql-data-source.model';
import { LogEvent } from '../../waterfall/waterfall/waterfall-chart';

@Model({
  type: 'log-detail-data-source'
})
export class LogDetailDataSourceModel extends GraphQlDataSourceModel<Dictionary<unknown>> {
  @ModelProperty({
    key: 'log-event',
    required: true,
    type: PLAIN_OBJECT_PROPERTY.type
  })
  public logEvent?: LogEvent;

  public getData(): Observable<Dictionary<unknown>> {
    return of(this.logEvent?.attributes ?? {});
  }
}

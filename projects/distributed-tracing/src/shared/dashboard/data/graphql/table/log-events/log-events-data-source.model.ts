import { TableDataResponse, TableDataSource, TableRow } from '@hypertrace/components';
import { ARRAY_PROPERTY, Model, ModelProperty, NUMBER_PROPERTY } from '@hypertrace/hyperdash';
import { Observable, of } from 'rxjs';
import { LogEvent } from '../../../../widgets/waterfall/waterfall/waterfall-chart';
import { GraphQlDataSourceModel } from '../../graphql-data-source.model';

@Model({
  type: 'log-events-data-source'
})
export class LogEventsDataSourceModel extends GraphQlDataSourceModel<TableDataSource<TableRow>> {
  @ModelProperty({
    key: 'log-events',
    required: false,
    type: ARRAY_PROPERTY.type
  })
  public logEvents?: LogEvent[];

  @ModelProperty({
    key: 'start-time',
    required: false,
    type: NUMBER_PROPERTY.type
  })
  public startTime?: number;

  public getData(): Observable<TableDataSource<TableRow>> {
    return of({
      getData: () => of(this.tableDataResponse(this.logEvents ?? [])),
      getScope: () => ''
    });
  }

  private tableDataResponse(logEventData: LogEvent[]): TableDataResponse<TableRow> {
    return {
      data: logEventData.map((logEvent: LogEvent) => ({ ...logEvent, baseTimestamp: this.startTime })) as TableRow[],
      totalCount: logEventData.length
    };
  }
}

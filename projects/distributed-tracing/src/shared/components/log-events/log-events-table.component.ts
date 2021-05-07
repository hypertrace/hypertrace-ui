import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { DateCoercer, Dictionary } from '@hypertrace/common';
import {
  CoreTableCellRendererType,
  ListViewHeader,
  ListViewRecord,
  TableColumnConfig,
  TableDataResponse,
  TableDataSource,
  TableMode,
  TableRow
} from '@hypertrace/components';
import { isEmpty } from 'lodash-es';
import { Observable, of } from 'rxjs';

export const enum LogEventsTableViewType {
  Sheet = 'sheet',
  Page = 'page'
}

@Component({
  selector: 'ht-log-events-table',
  styleUrls: ['./log-events-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="log-events-table">
      <ht-table
        [columnConfigs]="this.columnConfigs"
        [data]="this.dataSource"
        [pageable]="false"
        [resizable]="false"
        mode=${TableMode.Detail}
        [detailContent]="detailContent"
      ></ht-table>
    </div>
    <ng-template #detailContent let-row="row">
      <div class="content">
        <ht-list-view
          [records]="this.getLogEventAttributeRecords(row.attributes)"
          [header]="this.header"
          data-sensitive-pii
        ></ht-list-view>
      </div>
    </ng-template>
  `
})
export class LogEventsTableComponent implements OnInit {
  @Input()
  public logEvents: Dictionary<unknown>[] = [];

  @Input()
  public logEventsTableViewType: LogEventsTableViewType = LogEventsTableViewType.Sheet;

  @Input()
  public spanStartTime?: number;

  public readonly header: ListViewHeader = { keyLabel: 'key', valueLabel: 'value' };
  private readonly dateCoercer: DateCoercer = new DateCoercer();

  public dataSource?: TableDataSource<TableRow>;
  public columnConfigs: TableColumnConfig[] = [];

  public ngOnInit(): void {
    this.buildDataSource();
    this.columnConfigs = this.getTableColumnConfigs();
  }

  public getLogEventAttributeRecords(attributes: Dictionary<unknown>): ListViewRecord[] {
    if (!isEmpty(attributes)) {
      return Object.entries(attributes).map((attribute: [string, unknown]) => ({
        key: attribute[0],
        value: attribute[1] as string | number
      }));
    }

    return [];
  }

  private buildDataSource(): void {
    this.dataSource = {
      getData: (): Observable<TableDataResponse<TableRow>> =>
        of({
          data: this.logEvents.map((logEvent: Dictionary<unknown>) => ({
            ...logEvent,
            timestamp: this.dateCoercer.coerce(logEvent.timestamp),
            baseTimestamp: this.dateCoercer.coerce(this.spanStartTime)
          })),
          totalCount: this.logEvents.length
        }),
      getScope: () => undefined
    };
  }

  private getTableColumnConfigs(): TableColumnConfig[] {
    if (this.logEventsTableViewType === LogEventsTableViewType.Sheet) {
      return [
        {
          id: 'timestamp',
          name: 'timestamp',
          title: 'Timestamp',
          display: CoreTableCellRendererType.RelativeTimestamp,
          visible: true,
          width: '150px',
          sortable: false,
          filterable: false
        },
        {
          id: 'summary',
          name: 'summary',
          title: 'Summary',
          visible: true,
          sortable: false,
          filterable: false
        }
      ];
    }

    return [];
  }
}

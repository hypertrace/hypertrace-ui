import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Dictionary } from '@hypertrace/common';
import { TableColumnConfig, TableDataResponse, TableDataSource, TableRow } from '@hypertrace/components';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'ht-span-exit-calls',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="span-exit-calls">
    <ht-table [columnConfigs]="this.columnConfigs" [data]="this.dataSource" [pageable]="false"></ht-table>
  </div> `
})
export class SpanExitCallsComponent implements OnInit {
  @Input()
  public exitCalls?: Dictionary<string>;

  public dataSource?: TableDataSource<TableRow>;
  public columnConfigs: TableColumnConfig[] = [
    {
      id: 'name',
      name: 'name',
      title: 'Service',
      visible: true,
      width: '80%',
      sortable: false,
      filterable: false
    },
    {
      id: 'calls',
      name: 'calls',
      title: 'Calls',
      visible: true,
      sortable: false,
      filterable: false
    }
  ];

  public ngOnInit(): void {
    this.buildDataSource();
  }

  private buildDataSource(): void {
    this.dataSource = {
      getData: (): Observable<TableDataResponse<TableRow>> =>
        of({
          data: Object.entries(this.exitCalls ?? {}).map(item => ({ name: item[0], calls: item[1] })),
          totalCount: Object.keys(this.exitCalls ?? {}).length
        }),
      getScope: () => undefined
    };
  }
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CoreTableCellRendererType, TableMode, TableSortDirection, TableStyle } from '@hypertrace/components';
import { TracingTableCellType } from '@hypertrace/distributed-tracing';
import { ModelJson } from '@hypertrace/hyperdash';
import { ObservabilityTableCellType } from '../../../shared/components/table/observability-table-cell-type';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="vertical-flex-layout">
      <ht-page-header></ht-page-header>
      <ht-navigable-dashboard [navLocation]="this.location" [defaultJson]="this.defaultJson"> </ht-navigable-dashboard>
    </div>
  `
})
export class ServiceListComponent {
  public readonly location: string = 'SERVICE_LIST';

  public readonly defaultJson: ModelJson = {
    type: 'table-widget',
    mode: TableMode.Tree,
    style: TableStyle.FullPage,
    searchable: true,
    columns: [
      {
        type: 'table-widget-column',
        title: 'Name',
        display: ObservabilityTableCellType.Entity,
        width: '30%',
        value: {
          type: 'entity-specification'
        }
      },
      {
        type: 'table-widget-column',
        title: 'p99 Latency',
        display: TracingTableCellType.Metric,
        value: {
          type: 'metric-aggregation',
          metric: 'duration',
          aggregation: 'p99'
        },
        sort: TableSortDirection.Descending
      },
      {
        type: 'table-widget-column',
        title: 'Avg Latency',
        display: TracingTableCellType.Metric,
        value: {
          type: 'metric-aggregation',
          metric: 'duration',
          aggregation: 'avg'
        }
      },
      {
        type: 'table-widget-column',
        title: 'Errors/s',
        display: CoreTableCellRendererType.Number,
        value: {
          type: 'metric-aggregation',
          metric: 'errorCount',
          aggregation: 'avgrate_sec'
        }
      },
      {
        type: 'table-widget-column',
        title: 'Errors',
        display: CoreTableCellRendererType.Number,
        value: {
          type: 'metric-aggregation',
          metric: 'errorCount',
          aggregation: 'sum'
        }
      },
      {
        type: 'table-widget-column',
        title: 'Calls/s',
        display: CoreTableCellRendererType.Number,
        value: {
          type: 'metric-aggregation',
          metric: 'numCalls',
          aggregation: 'avgrate_sec'
        }
      },
      {
        type: 'table-widget-column',
        title: 'Calls',
        display: CoreTableCellRendererType.Number,
        value: {
          type: 'metric-aggregation',
          metric: 'numCalls',
          aggregation: 'sum'
        }
      }
    ],
    data: {
      type: 'entity-table-data-source',
      entity: 'SERVICE',
      childEntity: 'API'
    }
  };
}

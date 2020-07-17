import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StandardTableCellRendererType, TableMode, TableSortDirection, TableStyle } from '@hypertrace/components';
import { TracingTableCellRenderer } from '@hypertrace/distributed-tracing';
import { ModelJson } from '@hypertrace/hyperdash';
import { ObservabilityTableCellRenderer } from '../../../shared/components/table/observability-table-cell-renderer';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <htc-page-header></htc-page-header>
    <htc-navigable-dashboard [navLocation]="this.location" [defaultJson]="this.defaultJson"> </htc-navigable-dashboard>
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
        display: ObservabilityTableCellRenderer.Entity,
        width: '30%',
        value: {
          type: 'entity-specification'
        }
      },
      {
        type: 'table-widget-column',
        title: 'p99 Latency',
        display: TracingTableCellRenderer.Metric,
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
        display: TracingTableCellRenderer.Metric,
        value: {
          type: 'metric-aggregation',
          metric: 'duration',
          aggregation: 'avg'
        }
      },
      {
        type: 'table-widget-column',
        title: 'Errors/s',
        display: StandardTableCellRendererType.Number,
        value: {
          type: 'metric-aggregation',
          metric: 'errorCount',
          aggregation: 'avgrate_sec'
        }
      },
      {
        type: 'table-widget-column',
        title: 'Errors',
        display: StandardTableCellRendererType.Number,
        value: {
          type: 'metric-aggregation',
          metric: 'errorCount',
          aggregation: 'sum'
        }
      },
      {
        type: 'table-widget-column',
        title: 'Calls/s',
        display: StandardTableCellRendererType.Number,
        value: {
          type: 'metric-aggregation',
          metric: 'numCalls',
          aggregation: 'avgrate_sec'
        }
      },
      {
        type: 'table-widget-column',
        title: 'Calls',
        display: StandardTableCellRendererType.Number,
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

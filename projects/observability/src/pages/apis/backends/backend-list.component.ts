import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StandardTableCellRendererType, TableSortDirection, TableStyle } from '@hypertrace/components';
import { TracingTableCellRenderer } from '@hypertrace/distributed-tracing';
import { ModelJson } from '@hypertrace/hyperdash';
import { ObservabilityTableCellRenderer } from '../../../shared/components/table/observability-table-cell-renderer';
import { ObservabilityEntityType } from '../../../shared/graphql/model/schema/entity';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <htc-page-header></htc-page-header>
    <htc-navigable-dashboard [navLocation]="this.location" [defaultJson]="this.defaultJson"> </htc-navigable-dashboard>
  `
})
export class BackendListComponent {
  public readonly location: string = 'BACKEND_LIST';
  public readonly defaultJson: ModelJson = {
    type: 'table-widget',
    style: TableStyle.FullPage,
    searchable: true,
    columns: [
      {
        type: 'table-widget-column',
        title: 'Name',
        display: ObservabilityTableCellRenderer.Entity,
        width: '30%',
        value: {
          type: 'entity-specification',
          'entity-type': ObservabilityEntityType.Backend
        }
      },
      {
        type: 'table-widget-column',
        title: 'Type',
        display: ObservabilityTableCellRenderer.BackendIcon,
        width: '80px',
        value: {
          type: 'attribute-specification',
          attribute: 'type'
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
      entity: 'BACKEND'
    }
  };
}

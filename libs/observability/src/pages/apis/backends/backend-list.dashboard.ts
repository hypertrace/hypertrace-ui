import { CoreTableCellRendererType, TableSortDirection, TableStyle } from '@hypertrace/components';
import { ObservabilityTableCellType } from '../../../shared/components/table/observability-table-cell-type';
import { TracingTableCellType } from '../../../shared/components/table/tracing-table-cell-type';
import { DashboardDefaultConfiguration } from '../../../shared/dashboard/dashboard-wrapper/navigable-dashboard.module';
import { ObservabilityEntityType } from '../../../shared/graphql/model/schema/entity';

export const backendListDashboard: DashboardDefaultConfiguration = {
  location: 'BACKEND_LIST',
  json: {
    type: 'table-widget',
    id: 'backends-list.table',
    style: TableStyle.FullPage,
    searchAttribute: 'name',
    columns: [
      {
        type: 'table-widget-column',
        title: 'Name',
        display: ObservabilityTableCellType.Entity,
        width: '30%',
        value: {
          type: 'entity-specification',
          'entity-type': ObservabilityEntityType.Backend
        }
      },
      {
        type: 'table-widget-column',
        title: 'Type',
        display: ObservabilityTableCellType.BackendIcon,
        width: '80px',
        value: {
          type: 'attribute-specification',
          attribute: 'type'
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
      entity: 'BACKEND'
    }
  }
};

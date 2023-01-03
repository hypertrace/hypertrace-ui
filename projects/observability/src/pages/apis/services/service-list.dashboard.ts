import { CoreTableCellRendererType, TableMode, TableSortDirection, TableStyle } from '@hypertrace/components';
import { ObservabilityTableCellType } from '../../../shared/components/table/observability-table-cell-type';
import { TracingTableCellType } from '../../../shared/components/table/tracing-table-cell-type';
import { DashboardDefaultConfiguration } from '../../../shared/dashboard/dashboard-wrapper/navigable-dashboard.module';

export const serviceListDashboard: DashboardDefaultConfiguration = {
  location: 'SERVICE_LIST',
  json: {
    type: 'container-widget',
    layout: {
      type: 'auto-container-layout',
      'enable-style': false
    },
    children: [
      {
        type: 'table-widget',
        id: 'service-list.table',
        mode: TableMode.Flat,
        style: TableStyle.FullPage,
        searchAttribute: 'name',
        pageable: false,
        columns: [
          {
            type: 'table-widget-column',
            title: 'Name',
            display: ObservabilityTableCellType.Entity,
            width: '30%',
            value: {
              type: 'entity-specification'
            },
            sort: TableSortDirection.Ascending
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
            visible: false
          },
          {
            type: 'table-widget-column',
            title: 'Avg Latency',
            display: TracingTableCellType.Metric,
            value: {
              type: 'metric-aggregation',
              metric: 'duration',
              aggregation: 'avg'
            },
            visible: false
          },
          {
            type: 'table-widget-column',
            title: 'Errors/s',
            display: CoreTableCellRendererType.Number,
            value: {
              type: 'metric-aggregation',
              metric: 'errorCount',
              aggregation: 'avgrate_sec'
            },
            visible: false
          },
          {
            type: 'table-widget-column',
            title: 'Errors',
            display: CoreTableCellRendererType.Number,
            value: {
              type: 'metric-aggregation',
              metric: 'errorCount',
              aggregation: 'sum'
            },
            visible: false
          },
          {
            type: 'table-widget-column',
            title: 'Calls/s',
            display: CoreTableCellRendererType.Number,
            value: {
              type: 'metric-aggregation',
              metric: 'numCalls',
              aggregation: 'avgrate_sec'
            },
            visible: false
          },
          {
            type: 'table-widget-column',
            title: 'Calls',
            display: CoreTableCellRendererType.Number,
            value: {
              type: 'metric-aggregation',
              metric: 'numCalls',
              aggregation: 'sum'
            },
            visible: false
          }
        ],
        data: {
          type: 'entity-table-data-source',
          entity: 'SERVICE',
          isClientSideFiltered: true,
          limit: 250,
          clientSideSort: {
            direction: TableSortDirection.Ascending,
            defaultSortColumnIndex: 0
          }
        }
      }
    ]
  }
};

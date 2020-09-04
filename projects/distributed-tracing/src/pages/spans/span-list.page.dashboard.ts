import { CoreTableCellRendererType, TableMode, TableSortDirection, TableStyle } from '@hypertrace/components';
import { TracingTableCellType } from '../../shared/components/table/tracing-table-cell-type';
import { DashboardDefaultConfiguration } from '../../shared/dashboard/dashboard-wrapper/navigable-dashboard.module';

export const spanListDashboard: DashboardDefaultConfiguration = {
  location: 'SPANS',
  json: {
    type: 'table-widget',
    style: TableStyle.FullPage,
    columns: [
      {
        type: 'table-widget-column',
        title: 'Name',
        value: {
          type: 'attribute-specification',
          attribute: 'displaySpanName'
        },
        'click-handler': {
          type: 'span-trace-navigation-handler'
        }
      },
      {
        type: 'table-widget-column',
        title: 'Status',
        width: '100px', // Use Status Cell Renderer
        value: {
          type: 'attribute-specification',
          attribute: 'statusCode'
        },
        'click-handler': {
          type: 'span-trace-navigation-handler'
        }
      },
      {
        type: 'table-widget-column',
        title: 'Latency',
        width: '120px',
        display: TracingTableCellType.Metric,
        value: {
          type: 'attribute-specification',
          attribute: 'duration'
        },
        'click-handler': {
          type: 'span-trace-navigation-handler'
        }
      },
      {
        type: 'table-widget-column',
        title: 'Timestamp',
        width: '220px',
        display: CoreTableCellRendererType.Timestamp,
        value: {
          type: 'attribute-specification',
          attribute: 'startTime'
        },
        sort: TableSortDirection.Descending,
        'click-handler': {
          type: 'span-trace-navigation-handler'
        }
      },
      {
        type: 'table-widget-column',
        title: 'TraceId',
        width: '10%',
        visible: false,
        value: {
          type: 'attribute-specification',
          attribute: 'traceId'
        }
      }
    ],
    mode: TableMode.Detail,
    'child-template': {
      type: 'span-detail-widget',
      data: {
        type: 'span-detail-data-source',
        // tslint:disable-next-line: no-invalid-template-strings
        span: '${row}'
      }
    },
    data: {
      type: 'spans-table-data-source'
    }
  }
};

import { CoreTableCellRendererType, TableMode, TableSortDirection, TableStyle } from '@hypertrace/components';
import { TracingTableCellType } from '@hypertrace/distributed-tracing';
import { ObservabilityTraceType } from '../../../../shared/graphql/model/schema/observability-traces';

export const backendTraceListDashboard = {
  location: 'BACKEND_TRACES',
  json: {
    type: 'table-widget',
    persistId: 'backend-trace-list.table',
    style: TableStyle.FullPage,
    columns: [
      {
        type: 'table-widget-column',
        title: 'Type',
        width: '10%',
        filterable: true,
        value: {
          type: 'attribute-specification',
          attribute: 'type'
        }
      },
      {
        type: 'table-widget-column',
        title: 'Name',
        width: '1',
        filterable: true,
        value: {
          type: 'attribute-specification',
          attribute: 'name'
        }
      },
      {
        type: 'table-widget-column',
        title: 'Duration',
        width: '10%',
        display: TracingTableCellType.Metric,
        filterable: true,
        value: {
          type: 'enriched-attribute-specification',
          attribute: 'duration',
          units: 'ms'
        }
      },
      {
        type: 'table-widget-column',
        title: 'Start Time',
        width: '220px',
        display: CoreTableCellRendererType.Timestamp,
        value: {
          type: 'attribute-specification',
          attribute: 'startTime'
        },
        sort: TableSortDirection.Descending
      }
    ],
    mode: TableMode.Detail,
    'child-template': {
      type: 'trace-detail-widget',
      data: {
        type: 'api-trace-detail-data-source',
        // tslint:disable-next-line: no-invalid-template-strings
        trace: '${row}'
      }
    },
    data: {
      type: 'traces-table-data-source',
      trace: ObservabilityTraceType.Backend
    }
  }
};

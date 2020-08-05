import { StandardTableCellRendererType, TableMode, TableSortDirection, TableStyle } from '@hypertrace/components';
import { TracingTableCellRenderer } from '@hypertrace/distributed-tracing';
import { ObservabilityTraceType } from '../../../../shared/graphql/model/schema/observability-traces';

export const backendTraceListDashboard = {
  location: 'BACKEND_TRACES',
  json: {
    type: 'table-widget',
    style: TableStyle.FullPage,
    columns: [
      {
        type: 'table-widget-column',
        title: 'Type',
        width: '10%',
        value: {
          type: 'attribute-specification',
          attribute: 'type'
        }
      },
      {
        type: 'table-widget-column',
        title: 'Name',
        width: '1',
        value: {
          type: 'attribute-specification',
          attribute: 'name'
        }
      },
      {
        type: 'table-widget-column',
        title: 'Duration',
        width: '10%',
        display: TracingTableCellRenderer.Metric,
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
        display: StandardTableCellRendererType.Timestamp,
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
        type: 'trace-detail-data-source',
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

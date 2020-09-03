import { CoreTableCellRendererType, TableMode, TableSortDirection, TableStyle } from '@hypertrace/components';
import { TracingTableCellType } from '@hypertrace/distributed-tracing';
import { ObservabilityTraceType } from '../../../../shared/graphql/model/schema/observability-traces';

export const serviceTraceListDashboard = {
  location: 'SERVICE_TRACES',
  json: {
    type: 'table-widget',
    style: TableStyle.FullPage,
    columns: [
      {
        type: 'table-widget-column',
        title: 'Protocol',
        width: '10%',
        value: {
          type: 'attribute-specification',
          attribute: 'protocol'
        },
        'click-handler': {
          type: 'api-trace-navigation-handler'
        }
      },
      {
        type: 'table-widget-column',
        title: 'Endpoint',
        width: '20%',
        value: {
          type: 'attribute-specification',
          attribute: 'apiName'
        },
        'click-handler': {
          type: 'api-trace-navigation-handler'
        }
      },
      {
        type: 'table-widget-column',
        title: 'URL',
        value: {
          type: 'attribute-specification',
          attribute: 'requestUrl'
        },
        'click-handler': {
          type: 'api-trace-navigation-handler'
        }
      },
      {
        type: 'table-widget-column',
        title: 'Status',
        width: '10%',
        display: TracingTableCellType.TraceStatus,
        value: {
          type: 'trace-status-specification'
        },
        'click-handler': {
          type: 'api-trace-navigation-handler'
        }
      },
      {
        type: 'table-widget-column',
        title: 'Duration',
        width: '10%',
        display: TracingTableCellType.Metric,
        value: {
          type: 'enriched-attribute-specification',
          attribute: 'duration',
          units: 'ms'
        },
        'click-handler': {
          type: 'api-trace-navigation-handler'
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
        'click-handler': {
          type: 'api-trace-navigation-handler'
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
        trace: '${row}',
        attributes: ['requestUrl']
      }
    },
    data: {
      type: 'traces-table-data-source',
      trace: ObservabilityTraceType.Api
    }
  }
};

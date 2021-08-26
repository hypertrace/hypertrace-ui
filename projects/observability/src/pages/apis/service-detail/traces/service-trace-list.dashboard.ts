import { CoreTableCellRendererType, TableMode, TableSortDirection, TableStyle } from '@hypertrace/components';
import { TracingTableCellType } from '@hypertrace/observability';
import { ObservabilityTableCellType } from '../../../../shared/components/table/observability-table-cell-type';
import { ObservabilityTraceType } from '../../../../shared/graphql/model/schema/observability-traces';

export const serviceTraceListDashboard = {
  location: 'SERVICE_TRACES',
  json: {
    type: 'table-widget',
    id: 'service-trace-list.table',
    style: TableStyle.FullPage,
    columns: [
      {
        type: 'table-widget-column',
        title: 'Protocol',
        width: '10%',
        filterable: true,
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
        filterable: true,
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
        filterable: true,
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
        title: 'Exit Calls',
        filterable: false,
        display: ObservabilityTableCellType.ExitCalls,
        value: {
          type: 'composite-specification',
          specifications: [
            {
              type: 'attribute-specification',
              attribute: 'apiExitCalls'
            },
            {
              type: 'attribute-specification',
              attribute: 'apiCalleeNameCount'
            }
          ],
          'order-by': 'apiExitCalls'
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
        filterable: true,
        value: {
          type: 'trace-status-specification'
        },
        'click-handler': {
          type: 'api-trace-navigation-handler'
        }
      },
      {
        type: 'table-widget-column',
        title: 'Errors',
        width: '80px',
        filterable: true,
        value: {
          type: 'attribute-specification',
          attribute: 'apiTraceErrorSpanCount'
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
        filterable: true,
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
        type: 'api-trace-detail-data-source',
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

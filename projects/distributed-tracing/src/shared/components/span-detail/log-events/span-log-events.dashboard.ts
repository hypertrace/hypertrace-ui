import { TableMode, TableStyle } from '@hypertrace/components';
import { ObservabilityTableCellType } from '../../../../../../observability/src/shared/components/table/observability-table-cell-type';

export const spanLogEventsDashboard = {
  location: 'SPAN_LOG_EVENTS',
  json: {
    type: 'table-widget',
    id: 'span-log-records.table',
    style: TableStyle.FullPage,
    resizable: false,
    columns: [
      {
        type: 'table-widget-column',
        title: 'Timestamp',
        width: '150px',
        display: ObservabilityTableCellType.LogTimestamp,
        filterable: false,
        sortable: false,
        value: {
          type: 'attribute-specification',
          attribute: 'timestamp'
        }
      },
      {
        type: 'table-widget-column',
        title: 'Summary',
        filterable: false,
        sortable: false,
        value: {
          type: 'attribute-specification',
          attribute: 'summary'
        }
      }
    ],
    mode: TableMode.Detail,
    'child-template': {
      type: 'log-detail-widget',
      data: {
        type: 'log-detail-data-source',
        // tslint:disable-next-line: no-invalid-template-strings
        'log-event': '${row}'
      }
    },
    data: {
      type: 'log-events-data-source',
      // tslint:disable-next-line: no-invalid-template-strings
      'log-events': '${logEvents}',
      // tslint:disable-next-line: no-invalid-template-strings
      'start-time': '${startTime}'
    }
  }
};

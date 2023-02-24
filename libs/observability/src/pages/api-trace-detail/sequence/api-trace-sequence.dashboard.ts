import { DashboardDefaultConfiguration } from '../../../shared/dashboard/dashboard-wrapper/navigable-dashboard.module';

export const apiTraceSequenceDashboard: DashboardDefaultConfiguration = {
  location: 'API_TRACE_SEQUENCE',
  json: {
    type: 'container-widget',
    layout: {
      type: 'auto-container-layout',
      'enable-style': false
    },
    children: [
      {
        type: 'waterfall-widget',
        title: 'Sequence Diagram',
        data: {
          type: 'api-trace-waterfall-data-source',
          // tslint:disable-next-line: no-invalid-template-strings
          'trace-id': '${traceId}',
          // tslint:disable-next-line: no-invalid-template-strings
          'start-time': '${startTime}'
        }
      }
    ]
  }
};

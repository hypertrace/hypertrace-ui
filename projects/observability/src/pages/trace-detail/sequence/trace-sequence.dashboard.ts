import { DashboardDefaultConfiguration } from '../../../shared/dashboard/dashboard-wrapper/navigable-dashboard.module';

export const traceSequenceDashboard: DashboardDefaultConfiguration = {
  location: 'TRACE_SEQUENCE',
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
          type: 'trace-waterfall-data-source',
          'trace-id': '${traceId}',

          'entry-span-id': '${spanId}',

          'start-time': '${startTime}'
        }
      }
    ]
  }
};

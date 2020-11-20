import { Color } from '@hypertrace/common';
import { DashboardDefaultConfiguration, MetricAggregationType } from '@hypertrace/distributed-tracing';
import { LegendPosition, SeriesVisualizationType } from '@hypertrace/observability';

// tslint:disable: max-file-line-count
export const homeDashboard: DashboardDefaultConfiguration = {
  location: 'HOME_DASHBOARD',
  json: {
    type: 'container-widget',
    layout: {
      type: 'auto-container-layout',
      rows: 4,
      'enable-style': false,
      'grid-gap': '48px'
    },
    children: [
      {
        type: 'cartesian-widget',
        title: 'Latency',
        'legend-position': LegendPosition.None,
        'selectable-interval': false,
        'x-axis': {
          type: 'cartesian-axis',
          'show-grid-lines': false
        },
        'show-y-axis': true,
        'y-axis': {
          type: 'cartesian-axis',
          'show-grid-lines': true,
          'min-upper-limit': 25
        },
        range: {
          type: 'range',
          name: 'Test Range',
          color: Color.Gray2,
          upperSeries: {
            type: 'series',
            name: 'P99 Duration',
            color: Color.Gray3,
            'visualization-type': SeriesVisualizationType.Dashed,
            data: {
              type: 'trace-metric-timeseries-data-source',
              metric: {
                type: 'explore-selection',
                metric: 'duration',
                aggregation: MetricAggregationType.P99
              }
            }
          },
          lowerSeries: {
            type: 'series',
            name: 'P50 Duration',
            color: Color.Gray3,
            'visualization-type': SeriesVisualizationType.Dashed,
            data: {
              type: 'trace-metric-timeseries-data-source',
              metric: {
                type: 'explore-selection',
                metric: 'duration',
                aggregation: MetricAggregationType.P50
              }
            }
          }
        },
        series: [
          {
            type: 'series',
            name: 'P90 Duration',
            color: Color.Gray5,
            'visualization-type': 'line',
            hide: false,
            data: {
              type: 'trace-metric-timeseries-data-source',
              metric: {
                type: 'explore-selection',
                metric: 'duration',
                aggregation: MetricAggregationType.P90
              }
            }
          },
          {
            type: 'series',
            name: 'Calls',
            color: Color.Gray7,
            'visualization-type': 'line',
            hide: false,
            data: {
              type: 'trace-metric-timeseries-data-source',
              metric: {
                type: 'explore-selection',
                metric: 'calls',
                aggregation: MetricAggregationType.Sum
              }
            }
          }
        ]
      }
    ]
  }
};

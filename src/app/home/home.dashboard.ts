import { StandardTableCellRendererType, TableMode, TableStyle, TitlePosition } from '@hypertrace/components';
import {
  DashboardDefaultConfiguration,
  GraphQlOperatorType,
  MetricAggregationType,
  TracingTableCellRenderer
} from '@hypertrace/distributed-tracing';
import { LegendPosition, ObservabilityTableCellRenderer } from '@hypertrace/observability';

// tslint:disable: max-file-line-count
export const homeDashboard: DashboardDefaultConfiguration = {
  location: 'HOME_DASHBOARD',
  json: {
    type: 'container-widget',
    layout: {
      type: 'custom-container-layout',
      'enable-style': false,
      'column-dimensions': [
        {
          type: 'dimension-model',
          dimension: 1,
          unit: 'FR'
        },
        {
          type: 'dimension-model',
          dimension: 1,
          unit: 'FR'
        }
      ],
      'row-dimensions': [
        {
          type: 'dimension-model',
          dimension: 400,
          unit: 'PX'
        },
        {
          type: 'dimension-model',
          dimension: 58,
          unit: 'PX'
        },
        {
          type: 'dimension-model',
          dimension: 320,
          unit: 'PX'
        },
        {
          type: 'dimension-model',
          dimension: 32,
          unit: 'PX'
        },
        {
          type: 'dimension-model',
          dimension: 284,
          unit: 'PX'
        },
        {
          type: 'dimension-model',
          dimension: 284,
          unit: 'PX'
        },
        {
          type: 'dimension-model',
          dimension: 284,
          unit: 'PX'
        }
      ],
      'cell-spans': [
        {
          type: 'cell-span-model',
          'col-start': 0,
          'col-end': 1,
          'row-start': 0,
          'row-end': 1
        },
        {
          type: 'cell-span-model',
          'col-start': 1,
          'col-end': 2,
          'row-start': 0,
          'row-end': 1
        },
        {
          type: 'cell-span-model',
          'col-start': 0,
          'col-end': 1,
          'row-start': 1,
          'row-end': 2
        },
        {
          type: 'cell-span-model',
          'col-start': 0,
          'col-end': 2,
          'row-start': 2,
          'row-end': 3
        },
        {
          type: 'cell-span-model',
          'col-start': 0,
          'col-end': 1,
          'row-start': 3,
          'row-end': 4
        },
        {
          type: 'cell-span-model',
          'col-start': 0,
          'col-end': 3,
          'row-start': 4,
          'row-end': 5
        },
        {
          type: 'cell-span-model',
          'col-start': 0,
          'col-end': 3,
          'row-start': 5,
          'row-end': 6
        },
        {
          type: 'cell-span-model',
          'col-start': 0,
          'col-end': 3,
          'row-start': 6,
          'row-end': 7
        }
      ]
    },
    children: [
      {
        type: 'container-widget',
        layout: {
          type: 'custom-container-layout',
          'enable-style': false,
          'row-dimensions': [
            {
              type: 'dimension-model',
              dimension: 144,
              unit: 'PX'
            },
            {
              type: 'dimension-model',
              dimension: 32,
              unit: 'PX'
            },
            {
              type: 'dimension-model',
              dimension: 80,
              unit: 'PX'
            },
            {
              type: 'dimension-model',
              dimension: 144,
              unit: 'PX'
            }
          ],
          'column-dimensions': [
            {
              type: 'dimension-model',
              dimension: 1,
              unit: 'FR'
            }
          ],
          'cell-spans': [
            {
              type: 'cell-span-model',
              'col-start': 0,
              'col-end': 1,
              'row-start': 0,
              'row-end': 1
            },
            {
              type: 'cell-span-model',
              'col-start': 0,
              'col-end': 1,
              'row-start': 1,
              'row-end': 2
            },
            {
              type: 'cell-span-model',
              'col-start': 0,
              'col-end': 1,
              'row-start': 2,
              'row-end': 3
            },
            {
              type: 'cell-span-model',
              'col-start': 0,
              'col-end': 1,
              'row-start': 3,
              'row-end': 4
            }
          ]
        },
        children: [
          {
            type: 'container-widget',
            layout: {
              type: 'auto-container-layout',
              rows: 1,
              'enable-style': false
            }
          },
          {
            // To be replaced with greeting label
            type: 'highlighted-label-widget',
            'label-template': 'You have {totalErrors} total errors',
            data: {
              type: 'total-errors-label-data-source'
            }
          },
          {
            type: 'container-widget',
            layout: {
              type: 'auto-container-layout',
              rows: 1,
              'enable-style': false
            },
            children: [
              {
                type: 'metric-display-widget',
                title: 'Latency > 1s',
                subscript: '%',
                data: {
                  type: 'trace-calls-percentage-data-source',
                  filters: [
                    {
                      type: 'graphql-key-value-filter',
                      key: 'duration',
                      operator: GraphQlOperatorType.GreaterThan,
                      value: 1000
                    }
                  ]
                }
              },
              {
                type: 'metric-display-widget',
                title: 'Latency > 500ms',
                subscript: '%',
                data: {
                  type: 'trace-calls-percentage-data-source',
                  filters: [
                    {
                      type: 'graphql-key-value-filter',
                      key: 'duration',
                      operator: GraphQlOperatorType.GreaterThan,
                      value: 500
                    }
                  ]
                }
              },
              {
                type: 'metric-display-widget',
                title: 'Errors',
                subscript: '%',
                data: {
                  type: 'explore-error-percentage-data-source',
                  context: 'API_TRACE',
                  'error-count-metric-key': 'errorCount',
                  'call-count-metric-key': 'calls'
                }
              }
            ]
          },
          {
            type: 'container-widget',
            layout: {
              type: 'auto-container-layout',
              rows: 1,
              'enable-style': false
            }
          }
        ]
      },
      {
        type: 'radar-widget',
        levels: 8,
        series: {
          type: 'radar-series',
          name: 'Current Time Range',
          color: '#272c2e'
        },
        data: {
          type: 'observe-system-radar-data-source'
        }
      },
      {
        type: 'container-widget',
        layout: {
          type: 'auto-container-layout',
          rows: 1,
          'enable-style': false
        },
        children: [
          {
            type: 'metric-display-widget',
            title: 'p99 Latency',
            subscript: 'ms',
            'title-position': TitlePosition.Footer,
            data: {
              type: 'trace-metric-aggregation-data-source',
              metric: {
                type: 'explore-selection',
                metric: 'duration',
                aggregation: MetricAggregationType.P99
              }
            }
          },
          {
            type: 'metric-display-widget',
            title: 'p50 Latency',
            subscript: 'ms',
            'title-position': TitlePosition.Footer,
            data: {
              type: 'trace-metric-aggregation-data-source',
              metric: {
                type: 'explore-selection',
                metric: 'duration',
                aggregation: MetricAggregationType.P50
              }
            }
          },
          {
            type: 'metric-display-widget',
            title: 'Errors/Second',
            'title-position': TitlePosition.Footer,
            data: {
              type: 'trace-metric-aggregation-data-source',
              metric: {
                type: 'explore-selection',
                metric: 'errorCount',
                aggregation: MetricAggregationType.AvgrateSecond
              }
            }
          },
          {
            type: 'metric-display-widget',
            title: 'Calls/Second',
            'title-position': TitlePosition.Footer,
            data: {
              type: 'trace-metric-aggregation-data-source',
              metric: {
                type: 'explore-selection',
                metric: 'calls',
                aggregation: MetricAggregationType.AvgrateSecond
              }
            }
          }
        ]
      },
      {
        type: 'container-widget',
        layout: {
          type: 'auto-container-layout',
          rows: 1,
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
            series: [
              {
                type: 'series',
                name: 'p99',
                color: '#4b5f77',
                'visualization-type': 'line',
                data: {
                  type: 'trace-metric-timeseries-data-source',
                  metric: {
                    type: 'explore-selection',
                    metric: 'duration',
                    aggregation: MetricAggregationType.P99
                  }
                }
              },
              {
                type: 'series',
                name: 'p50',
                'visualization-type': 'line',
                color: '#70a7ff',
                data: {
                  type: 'trace-metric-timeseries-data-source',
                  metric: {
                    type: 'explore-selection',
                    metric: 'duration',
                    aggregation: MetricAggregationType.P50
                  }
                }
              },
              {
                type: 'series',
                name: 'Calls',
                color: '#272C2E',
                'visualization-type': 'line',
                hide: true,
                data: {
                  type: 'trace-metric-timeseries-data-source',
                  metric: {
                    type: 'explore-selection',
                    metric: 'calls',
                    aggregation: MetricAggregationType.Sum
                  }
                }
              },
              {
                type: 'series',
                name: 'Errors',
                'visualization-type': 'line',
                hide: true,
                color: '#FD5138',
                data: {
                  type: 'trace-metric-timeseries-data-source',
                  metric: {
                    type: 'explore-selection',
                    metric: 'errorCount',
                    aggregation: MetricAggregationType.Sum
                  }
                }
              }
            ]
          },
          {
            type: 'cartesian-widget',
            title: 'Calls',
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
            series: [
              {
                type: 'series',
                name: 'Calls',
                color: '#272C2E',
                'visualization-type': 'line',
                data: {
                  type: 'trace-metric-timeseries-data-source',
                  metric: {
                    type: 'explore-selection',
                    metric: 'calls',
                    aggregation: MetricAggregationType.Sum
                  }
                }
              },
              {
                type: 'series',
                name: 'p99',
                color: '#4b5f77',
                'visualization-type': 'line',
                hide: true,
                data: {
                  type: 'trace-metric-timeseries-data-source',
                  metric: {
                    type: 'explore-selection',
                    metric: 'duration',
                    aggregation: MetricAggregationType.P99
                  }
                }
              },
              {
                type: 'series',
                name: 'p50',
                'visualization-type': 'line',
                color: '#70a7ff',
                hide: true,
                data: {
                  type: 'trace-metric-timeseries-data-source',
                  metric: {
                    type: 'explore-selection',
                    metric: 'duration',
                    aggregation: MetricAggregationType.P50
                  }
                }
              },
              {
                type: 'series',
                name: 'Errors',
                'visualization-type': 'line',
                hide: true,
                color: '#FD5138',
                data: {
                  type: 'trace-metric-timeseries-data-source',
                  metric: {
                    type: 'explore-selection',
                    metric: 'errorCount',
                    aggregation: MetricAggregationType.Sum
                  }
                }
              }
            ]
          },
          {
            type: 'cartesian-widget',
            titile: 'Errors',
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
            series: [
              {
                type: 'series',
                name: 'Errors',
                'visualization-type': 'line',
                color: '#FD5138',
                data: {
                  type: 'trace-metric-timeseries-data-source',
                  metric: {
                    type: 'explore-selection',
                    metric: 'errorCount',
                    aggregation: MetricAggregationType.Sum
                  }
                }
              },
              {
                type: 'series',
                name: 'p99',
                color: '#4b5f77',
                'visualization-type': 'line',
                hide: true,
                data: {
                  type: 'trace-metric-timeseries-data-source',
                  metric: {
                    type: 'explore-selection',
                    metric: 'duration',
                    aggregation: MetricAggregationType.P99
                  }
                }
              },
              {
                type: 'series',
                name: 'p50',
                'visualization-type': 'line',
                color: '#70a7ff',
                hide: true,
                data: {
                  type: 'trace-metric-timeseries-data-source',
                  metric: {
                    type: 'explore-selection',
                    metric: 'duration',
                    aggregation: MetricAggregationType.P50
                  }
                }
              },
              {
                type: 'series',
                name: 'Calls',
                color: '#272C2E',
                'visualization-type': 'line',
                hide: true,
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
      },
      {
        type: 'text-widget',
        text: 'Top Assets'
      },
      {
        type: 'table-widget',
        mode: TableMode.Flat,
        style: TableStyle.FullPage,
        searchable: false,
        pageable: false,
        header: {
          type: 'widget-header',
          title: 'Endpoints'
        },
        columns: [
          {
            type: 'table-widget-column',
            title: 'Name',
            display: ObservabilityTableCellRenderer.Entity,
            width: '30%',
            value: {
              type: 'entity-specification'
            }
          },
          {
            type: 'table-widget-column',
            title: 'Avg Latency',
            display: TracingTableCellRenderer.Metric,
            value: {
              type: 'metric-aggregation',
              metric: 'duration',
              aggregation: MetricAggregationType.Average
            }
          },
          {
            type: 'table-widget-column',
            title: 'Errors/s',
            display: StandardTableCellRendererType.Number,
            value: {
              type: 'metric-aggregation',
              metric: 'errorCount',
              aggregation: MetricAggregationType.AvgrateSecond
            }
          },
          {
            type: 'table-widget-column',
            title: 'Errors',
            display: StandardTableCellRendererType.Number,
            value: {
              type: 'metric-aggregation',
              metric: 'errorCount',
              aggregation: MetricAggregationType.Sum
            }
          },
          {
            type: 'table-widget-column',
            title: 'Calls/s',
            display: StandardTableCellRendererType.Number,
            value: {
              type: 'metric-aggregation',
              metric: 'numCalls',
              aggregation: MetricAggregationType.AvgrateSecond
            }
          },
          {
            type: 'table-widget-column',
            title: 'Calls',
            display: StandardTableCellRendererType.Number,
            value: {
              type: 'metric-aggregation',
              metric: 'numCalls',
              aggregation: MetricAggregationType.Sum
            }
          }
        ],
        data: {
          type: 'entity-table-data-source',
          entity: 'API',
          limit: 5
        }
      },
      {
        type: 'table-widget',
        mode: TableMode.Flat,
        style: TableStyle.FullPage,
        searchable: false,
        pageable: false,
        header: {
          type: 'widget-header',
          title: 'Services',
          link: {
            type: 'link-widget',
            url: '/services',
            displayText: 'View All'
          }
        },
        columns: [
          {
            type: 'table-widget-column',
            title: 'Name',
            display: ObservabilityTableCellRenderer.Entity,
            width: '30%',
            value: {
              type: 'entity-specification'
            }
          },
          {
            type: 'table-widget-column',
            title: 'Avg Latency',
            display: TracingTableCellRenderer.Metric,
            value: {
              type: 'metric-aggregation',
              metric: 'duration',
              aggregation: MetricAggregationType.Average
            }
          },
          {
            type: 'table-widget-column',
            title: 'Errors/s',
            display: StandardTableCellRendererType.Number,
            value: {
              type: 'metric-aggregation',
              metric: 'errorCount',
              aggregation: MetricAggregationType.AvgrateSecond
            }
          },
          {
            type: 'table-widget-column',
            title: 'Errors',
            display: StandardTableCellRendererType.Number,
            value: {
              type: 'metric-aggregation',
              metric: 'errorCount',
              aggregation: MetricAggregationType.Sum
            }
          },
          {
            type: 'table-widget-column',
            title: 'Calls/s',
            display: StandardTableCellRendererType.Number,
            value: {
              type: 'metric-aggregation',
              metric: 'numCalls',
              aggregation: MetricAggregationType.AvgrateSecond
            }
          },
          {
            type: 'table-widget-column',
            title: 'Calls',
            display: StandardTableCellRendererType.Number,
            value: {
              type: 'metric-aggregation',
              metric: 'numCalls',
              aggregation: MetricAggregationType.Sum
            }
          }
        ],
        data: {
          type: 'entity-table-data-source',
          entity: 'SERVICE',
          limit: 5
        }
      },
      {
        type: 'table-widget',
        mode: TableMode.Flat,
        style: TableStyle.FullPage,
        searchable: false,
        pageable: false,

        header: {
          type: 'widget-header',
          title: 'Backends',
          link: {
            type: 'link-widget',
            url: '/backends',
            displayText: 'View All'
          }
        },
        columns: [
          {
            type: 'table-widget-column',
            title: 'Name',
            display: ObservabilityTableCellRenderer.Entity,
            width: '30%',
            value: {
              type: 'entity-specification'
            }
          },
          {
            type: 'table-widget-column',
            title: 'Avg Latency',
            display: TracingTableCellRenderer.Metric,
            value: {
              type: 'metric-aggregation',
              metric: 'duration',
              aggregation: MetricAggregationType.Average
            }
          },
          {
            type: 'table-widget-column',
            title: 'Errors/s',
            display: StandardTableCellRendererType.Number,
            value: {
              type: 'metric-aggregation',
              metric: 'errorCount',
              aggregation: MetricAggregationType.AvgrateSecond
            }
          },
          {
            type: 'table-widget-column',
            title: 'Errors',
            display: StandardTableCellRendererType.Number,
            value: {
              type: 'metric-aggregation',
              metric: 'errorCount',
              aggregation: MetricAggregationType.Sum
            }
          },
          {
            type: 'table-widget-column',
            title: 'Calls/s',
            display: StandardTableCellRendererType.Number,
            value: {
              type: 'metric-aggregation',
              metric: 'numCalls',
              aggregation: MetricAggregationType.AvgrateSecond
            }
          },
          {
            type: 'table-widget-column',
            title: 'Calls',
            display: StandardTableCellRendererType.Number,
            value: {
              type: 'metric-aggregation',
              metric: 'numCalls',
              aggregation: MetricAggregationType.Sum
            }
          }
        ],
        data: {
          type: 'entity-table-data-source',
          entity: 'BACKEND',
          limit: 5
        }
      }
    ]
  }
};

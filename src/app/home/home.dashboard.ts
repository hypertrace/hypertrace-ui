import { Color } from '@hypertrace/common';
import { CoreTableCellRendererType, TableMode, TableStyle, TitlePosition } from '@hypertrace/components';
import {
  DashboardDefaultConfiguration,
  GraphQlOperatorType,
  LegendPosition,
  MetricAggregationType,
  ObservabilityTableCellType,
  TracingTableCellType
} from '@hypertrace/observability';

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
            type: 'greeting-label-widget',
            'suffix-label': ", here's your trace report:"
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
                  type: 'percentage-composite-data-source',
                  numerator: {
                    type: 'metric-aggregation-data-source',
                    context: 'API_TRACE',
                    metric: {
                      type: 'explore-selection',
                      metric: 'calls',
                      aggregation: MetricAggregationType.Count
                    },
                    filters: [
                      {
                        type: 'graphql-key-value-filter',
                        key: 'duration',
                        operator: GraphQlOperatorType.GreaterThan,
                        value: 1000
                      }
                    ]
                  },
                  denominator: {
                    type: 'metric-aggregation-data-source',
                    context: 'API_TRACE',
                    metric: {
                      type: 'explore-selection',
                      metric: 'calls',
                      aggregation: MetricAggregationType.Sum
                    }
                  }
                }
              },
              {
                type: 'metric-display-widget',
                title: 'Latency > 500ms',
                subscript: '%',
                data: {
                  type: 'percentage-composite-data-source',
                  numerator: {
                    type: 'metric-aggregation-data-source',
                    context: 'API_TRACE',
                    metric: {
                      type: 'explore-selection',
                      metric: 'calls',
                      aggregation: MetricAggregationType.Count
                    },
                    filters: [
                      {
                        type: 'graphql-key-value-filter',
                        key: 'duration',
                        operator: GraphQlOperatorType.GreaterThan,
                        value: 500
                      }
                    ]
                  },
                  denominator: {
                    type: 'metric-aggregation-data-source',
                    context: 'API_TRACE',
                    metric: {
                      type: 'explore-selection',
                      metric: 'calls',
                      aggregation: MetricAggregationType.Sum
                    }
                  }
                }
              },
              {
                type: 'metric-display-widget',
                title: 'Errors',
                subscript: '%',
                data: {
                  type: 'percentage-composite-data-source',
                  numerator: {
                    type: 'metric-aggregation-data-source',
                    context: 'API_TRACE',
                    metric: {
                      type: 'explore-selection',
                      metric: 'errorCount',
                      aggregation: MetricAggregationType.Sum
                    }
                  },
                  denominator: {
                    type: 'metric-aggregation-data-source',
                    context: 'API_TRACE',
                    metric: {
                      type: 'explore-selection',
                      metric: 'calls',
                      aggregation: MetricAggregationType.Sum
                    }
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
          color: Color.Gray7
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
            'selectable-interval': true,
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
            'mouse-sync': true,
            'sync-group-id': 'HOME_DASHBOARD',

            series: [
              {
                type: 'series',
                name: 'p99',
                color: Color.BlueGray4,
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
                color: Color.Blue3,
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
                color: Color.Gray7,
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
                color: Color.Red5,
                data: {
                  type: 'trace-metric-timeseries-data-source',
                  metric: {
                    type: 'explore-selection',
                    metric: 'errorCount',
                    aggregation: MetricAggregationType.Sum
                  }
                }
              }
            ],
            'selection-handler': {
              type: 'cartesian-explorer-selection-handler'
            }
          },
          {
            type: 'cartesian-widget',
            title: 'Calls',
            'legend-position': LegendPosition.None,
            'selectable-interval': true,
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
            'mouse-sync': true,
            'sync-group-id': 'HOME_DASHBOARD',
            series: [
              {
                type: 'series',
                name: 'Calls',
                color: Color.Gray7,
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
                color: Color.BlueGray4,
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
                color: Color.Blue3,
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
                color: Color.Red5,
                data: {
                  type: 'trace-metric-timeseries-data-source',
                  metric: {
                    type: 'explore-selection',
                    metric: 'errorCount',
                    aggregation: MetricAggregationType.Sum
                  }
                }
              }
            ],
            'selection-handler': {
              type: 'cartesian-explorer-selection-handler'
            }
          },
          {
            type: 'cartesian-widget',
            title: 'Errors',
            'legend-position': LegendPosition.None,
            'selectable-interval': true,
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
            'mouse-sync': true,
            'sync-group-id': 'HOME_DASHBOARD',
            series: [
              {
                type: 'series',
                name: 'Errors',
                'visualization-type': 'line',
                color: Color.Red5,
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
                color: Color.BlueGray4,
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
                color: Color.Blue3,
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
                color: Color.Gray7,
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
            ],
            'selection-handler': {
              type: 'cartesian-explorer-selection-handler'
            }
          }
        ]
      },
      {
        type: 'text-widget',
        text: 'Top Assets'
      },
      {
        type: 'table-widget',
        id: 'home.endpoints-table',
        mode: TableMode.Flat,
        style: TableStyle.FullPage,
        pageable: false,
        header: {
          type: 'widget-header',
          title: 'Endpoints'
        },
        columns: [
          {
            type: 'table-widget-column',
            title: 'Name',
            display: ObservabilityTableCellType.Entity,
            width: '30%',
            value: {
              type: 'entity-specification'
            }
          },
          {
            type: 'table-widget-column',
            title: 'Avg Latency',
            display: TracingTableCellType.Metric,
            value: {
              type: 'metric-aggregation',
              metric: 'duration',
              aggregation: MetricAggregationType.Average
            }
          },
          {
            type: 'table-widget-column',
            title: 'Errors/s',
            display: CoreTableCellRendererType.Number,
            value: {
              type: 'metric-aggregation',
              metric: 'errorCount',
              aggregation: MetricAggregationType.AvgrateSecond
            }
          },
          {
            type: 'table-widget-column',
            title: 'Errors',
            display: CoreTableCellRendererType.Number,
            value: {
              type: 'metric-aggregation',
              metric: 'errorCount',
              aggregation: MetricAggregationType.Sum
            }
          },
          {
            type: 'table-widget-column',
            title: 'Calls/s',
            display: CoreTableCellRendererType.Number,
            value: {
              type: 'metric-aggregation',
              metric: 'numCalls',
              aggregation: MetricAggregationType.AvgrateSecond
            }
          },
          {
            type: 'table-widget-column',
            title: 'Calls',
            display: CoreTableCellRendererType.Number,
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
        id: 'home.services-table',
        mode: TableMode.Flat,
        style: TableStyle.FullPage,
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
            display: ObservabilityTableCellType.Entity,
            width: '30%',
            value: {
              type: 'entity-specification'
            }
          },
          {
            type: 'table-widget-column',
            title: 'Avg Latency',
            display: TracingTableCellType.Metric,
            value: {
              type: 'metric-aggregation',
              metric: 'duration',
              aggregation: MetricAggregationType.Average
            }
          },
          {
            type: 'table-widget-column',
            title: 'Errors/s',
            display: CoreTableCellRendererType.Number,
            value: {
              type: 'metric-aggregation',
              metric: 'errorCount',
              aggregation: MetricAggregationType.AvgrateSecond
            }
          },
          {
            type: 'table-widget-column',
            title: 'Errors',
            display: CoreTableCellRendererType.Number,
            value: {
              type: 'metric-aggregation',
              metric: 'errorCount',
              aggregation: MetricAggregationType.Sum
            }
          },
          {
            type: 'table-widget-column',
            title: 'Calls/s',
            display: CoreTableCellRendererType.Number,
            value: {
              type: 'metric-aggregation',
              metric: 'numCalls',
              aggregation: MetricAggregationType.AvgrateSecond
            }
          },
          {
            type: 'table-widget-column',
            title: 'Calls',
            display: CoreTableCellRendererType.Number,
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
        id: 'home.backends-table',
        mode: TableMode.Flat,
        style: TableStyle.FullPage,
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
            display: ObservabilityTableCellType.Entity,
            width: '30%',
            value: {
              type: 'entity-specification'
            }
          },
          {
            type: 'table-widget-column',
            title: 'Avg Latency',
            display: TracingTableCellType.Metric,
            value: {
              type: 'metric-aggregation',
              metric: 'duration',
              aggregation: MetricAggregationType.Average
            }
          },
          {
            type: 'table-widget-column',
            title: 'Errors/s',
            display: CoreTableCellRendererType.Number,
            value: {
              type: 'metric-aggregation',
              metric: 'errorCount',
              aggregation: MetricAggregationType.AvgrateSecond
            }
          },
          {
            type: 'table-widget-column',
            title: 'Errors',
            display: CoreTableCellRendererType.Number,
            value: {
              type: 'metric-aggregation',
              metric: 'errorCount',
              aggregation: MetricAggregationType.Sum
            }
          },
          {
            type: 'table-widget-column',
            title: 'Calls/s',
            display: CoreTableCellRendererType.Number,
            value: {
              type: 'metric-aggregation',
              metric: 'numCalls',
              aggregation: MetricAggregationType.AvgrateSecond
            }
          },
          {
            type: 'table-widget-column',
            title: 'Calls',
            display: CoreTableCellRendererType.Number,
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

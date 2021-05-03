import { Color } from '@hypertrace/common';
import { DashboardDefaultConfiguration, MetricAggregationType } from '@hypertrace/distributed-tracing';
import { LegendPosition } from '../../../../shared/components/legend/legend.component';
import { ObservabilityEntityType } from '../../../../shared/graphql/model/schema/entity';

// tslint:disable: max-file-line-count
export const serviceOverviewDashboard: DashboardDefaultConfiguration = {
  location: 'SERVICE_OVERVIEW',
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
          dimension: 0.3,
          unit: 'FR',
          'min-dimension': 345
        }
      ],
      'row-dimensions': [
        {
          type: 'dimension-model',
          dimension: 1084,
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
        }
      ]
    },
    children: [
      {
        type: 'container-widget',
        layout: {
          type: 'custom-container-layout',
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
              dimension: 88,
              unit: 'PX'
            },
            {
              type: 'dimension-model',
              dimension: 320,
              unit: 'PX'
            },
            {
              type: 'dimension-model',
              dimension: 640,
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
              'col-start': 2,
              'col-end': 3,
              'row-start': 0,
              'row-end': 1
            },
            {
              type: 'cell-span-model',
              'col-start': 0,
              'col-end': 3,
              'row-start': 1,
              'row-end': 2
            },
            {
              type: 'cell-span-model',
              'col-start': 0,
              'col-end': 3,
              'row-start': 2,
              'row-end': 3
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
            },
            children: [
              {
                type: 'metric-display-widget',
                title: 'P99 Latency',
                subscript: 'ms',
                data: {
                  type: 'entity-metric-aggregation-data-source',
                  metric: {
                    type: 'metric-aggregation',
                    metric: 'duration',
                    aggregation: MetricAggregationType.P99
                  }
                }
              },
              {
                type: 'metric-display-widget',
                title: 'P50 Latency',
                subscript: 'ms',
                data: {
                  type: 'entity-metric-aggregation-data-source',
                  metric: {
                    type: 'metric-aggregation',
                    metric: 'duration',
                    aggregation: MetricAggregationType.P50
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
            },
            children: [
              {
                type: 'metric-display-widget',
                title: 'Errors/Second',
                data: {
                  type: 'entity-metric-aggregation-data-source',
                  metric: {
                    type: 'metric-aggregation',
                    metric: 'errorCount',
                    aggregation: MetricAggregationType.AvgrateSecond
                  }
                }
              },
              {
                type: 'metric-display-widget',
                title: 'Total',
                data: {
                  type: 'entity-metric-aggregation-data-source',
                  metric: {
                    type: 'metric-aggregation',
                    metric: 'errorCount',
                    aggregation: MetricAggregationType.Sum
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
            },
            children: [
              {
                type: 'metric-display-widget',
                title: 'Calls/Second',
                data: {
                  type: 'entity-metric-aggregation-data-source',
                  metric: {
                    type: 'metric-aggregation',
                    metric: 'numCalls',
                    aggregation: MetricAggregationType.AvgrateSecond
                  }
                }
              },
              {
                type: 'metric-display-widget',
                title: 'Total',
                data: {
                  type: 'entity-metric-aggregation-data-source',
                  metric: {
                    type: 'metric-aggregation',
                    metric: 'numCalls',
                    aggregation: MetricAggregationType.Sum
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
                'selectable-interval': true,
                'legend-position': LegendPosition.None,
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
                'max-series-data-points': 150,
                bands: [
                  {
                    type: 'band',
                    name: 'P99 Baseline',
                    'upper-bound-name': 'P99 Upper Bound',
                    'lower-bound-name': 'P99 Lower Bound',
                    data: {
                      type: 'entity-metric-timeseries-data-source',
                      metric: {
                        type: 'metric-timeseries-band',
                        metric: 'duration',
                        aggregation: MetricAggregationType.P99
                      }
                    }
                  }
                ],
                series: [
                  {
                    type: 'series',
                    name: 'p99',
                    'visualization-type': 'line',
                    color: Color.BlueGray4,
                    data: {
                      type: 'entity-metric-timeseries-data-source',
                      metric: {
                        type: 'metric-timeseries',
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
                      type: 'entity-metric-timeseries-data-source',
                      metric: {
                        type: 'metric-timeseries',
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
                      type: 'entity-metric-timeseries-data-source',
                      metric: {
                        type: 'metric-timeseries',
                        metric: 'errorCount',
                        aggregation: MetricAggregationType.Sum
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
                      type: 'entity-metric-timeseries-data-source',
                      metric: {
                        type: 'metric-timeseries',
                        metric: 'numCalls',
                        aggregation: MetricAggregationType.Sum
                      }
                    }
                  }
                ]
              },
              {
                type: 'cartesian-widget',
                title: 'Errors',
                'selectable-interval': true,
                'legend-position': LegendPosition.None,
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
                'max-series-data-points': 150,
                bands: [
                  {
                    type: 'band',
                    name: 'Errors Baseline',
                    'upper-bound-name': 'Errors Upper Bound',
                    'lower-bound-name': 'Errors Lower Bound',
                    data: {
                      type: 'entity-metric-timeseries-data-source',
                      metric: {
                        type: 'metric-timeseries-band',
                        metric: 'errorCount',
                        aggregation: MetricAggregationType.Sum
                      }
                    }
                  }
                ],
                series: [
                  {
                    type: 'series',
                    name: 'Errors',
                    'visualization-type': 'line',
                    color: Color.Red5,
                    data: {
                      type: 'entity-metric-timeseries-data-source',
                      metric: {
                        type: 'metric-timeseries',
                        metric: 'errorCount',
                        aggregation: MetricAggregationType.Sum
                      }
                    }
                  },
                  {
                    type: 'series',
                    name: 'p99 Latency',
                    'visualization-type': 'line',
                    color: Color.BlueGray4,
                    hide: true,
                    data: {
                      type: 'entity-metric-timeseries-data-source',
                      metric: {
                        type: 'metric-timeseries',
                        metric: 'duration',
                        aggregation: MetricAggregationType.P99
                      }
                    }
                  },
                  {
                    type: 'series',
                    name: 'p50 Latency',
                    hide: true,
                    'visualization-type': 'line',
                    color: Color.Blue3,
                    data: {
                      type: 'entity-metric-timeseries-data-source',
                      metric: {
                        type: 'metric-timeseries',
                        metric: 'duration',
                        aggregation: MetricAggregationType.P50
                      }
                    }
                  },
                  {
                    type: 'series',
                    name: 'Calls',
                    hide: true,
                    color: Color.Gray7,
                    'visualization-type': 'line',
                    data: {
                      type: 'entity-metric-timeseries-data-source',
                      metric: {
                        type: 'metric-timeseries',
                        metric: 'numCalls',
                        aggregation: MetricAggregationType.Sum
                      }
                    }
                  }
                ]
              },
              {
                type: 'cartesian-widget',
                title: 'Calls',
                'selectable-interval': true,
                'legend-position': LegendPosition.None,
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
                'max-series-data-points': 150,
                bands: [
                  {
                    type: 'band',
                    name: 'Calls Baseline',
                    'upper-bound-name': 'Calls Upper Bound',
                    'lower-bound-name': 'Calls Lower Bound',
                    data: {
                      type: 'entity-metric-timeseries-data-source',
                      metric: {
                        type: 'metric-timeseries-band',
                        metric: 'numCalls',
                        aggregation: MetricAggregationType.Sum
                      }
                    }
                  }
                ],
                series: [
                  {
                    type: 'series',
                    name: 'Calls',
                    color: Color.Gray7,
                    'visualization-type': 'line',
                    data: {
                      type: 'entity-metric-timeseries-data-source',
                      metric: {
                        type: 'metric-timeseries',
                        metric: 'numCalls',
                        aggregation: MetricAggregationType.Sum
                      }
                    }
                  },
                  {
                    type: 'series',
                    name: 'p99 Latency',
                    hide: true,
                    'visualization-type': 'line',
                    color: Color.BlueGray4,
                    data: {
                      type: 'entity-metric-timeseries-data-source',
                      metric: {
                        type: 'metric-timeseries',
                        metric: 'duration',
                        aggregation: MetricAggregationType.P99
                      }
                    }
                  },
                  {
                    type: 'series',
                    name: 'p50 Latency',
                    hide: true,
                    'visualization-type': 'line',
                    color: Color.Blue3,
                    data: {
                      type: 'entity-metric-timeseries-data-source',
                      metric: {
                        type: 'metric-timeseries',
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
                      type: 'entity-metric-timeseries-data-source',
                      metric: {
                        type: 'metric-timeseries',
                        metric: 'errorCount',
                        aggregation: MetricAggregationType.Sum
                      }
                    }
                  }
                ]
              }
            ]
          },
          {
            type: 'topology-widget',
            title: 'Dependency Graph',
            data: {
              type: 'topology-data-source',
              'downstream-entities': ['API', 'BACKEND'],
              entity: 'SERVICE',
              'node-metrics': [
                {
                  type: 'percentile-latency-metric-aggregation',
                  'display-name': 'P99 Latency'
                },
                {
                  type: 'metric-aggregation',
                  metric: 'duration',
                  aggregation: MetricAggregationType.P50,
                  'display-name': 'P50 Latency'
                },
                {
                  type: 'error-percentage-metric-aggregation',
                  aggregation: MetricAggregationType.Average,
                  'display-name': 'Error %'
                },

                {
                  type: 'metric-aggregation',
                  metric: 'errorCount',
                  aggregation: MetricAggregationType.Sum,
                  'display-name': 'Error Count'
                },
                {
                  type: 'metric-aggregation',
                  metric: 'numCalls',
                  aggregation: MetricAggregationType.AvgrateSecond,
                  'display-name': 'Call Rate/sec'
                },
                {
                  type: 'metric-aggregation',
                  metric: 'numCalls',
                  aggregation: MetricAggregationType.Sum,
                  'display-name': 'Call Count'
                }
              ],
              'edge-metrics': [
                {
                  type: 'percentile-latency-metric-aggregation',
                  'display-name': 'P99 Latency'
                },
                {
                  type: 'metric-aggregation',
                  metric: 'duration',
                  aggregation: MetricAggregationType.P50,
                  'display-name': 'P50 Latency'
                },
                {
                  type: 'error-percentage-metric-aggregation',
                  aggregation: MetricAggregationType.Average,
                  'display-name': 'Error %'
                },

                {
                  type: 'metric-aggregation',
                  metric: 'errorCount',
                  aggregation: MetricAggregationType.Sum,
                  'display-name': 'Error Count'
                },
                {
                  type: 'metric-aggregation',
                  metric: 'numCalls',
                  aggregation: MetricAggregationType.AvgrateSecond,
                  'display-name': 'Call Rate/sec'
                },
                {
                  type: 'metric-aggregation',
                  metric: 'numCalls',
                  aggregation: MetricAggregationType.Sum,
                  'display-name': 'Call Count'
                }
              ]
            }
          }
        ]
      },
      {
        type: 'container-widget',
        layout: {
          type: 'custom-container-layout',
          'column-dimensions': [
            {
              type: 'dimension-model',
              dimension: 1,
              unit: 'FR'
            }
          ],
          'row-dimensions': [
            {
              type: 'dimension-model',
              dimension: 424,
              unit: 'PX'
            },
            {
              type: 'dimension-model',
              dimension: 640,
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
              'col-start': 0,
              'col-end': 1,
              'row-start': 1,
              'row-end': 2
            }
          ]
        },
        children: [
          {
            type: 'radar-widget',
            title: 'Health',
            levels: 8,
            series: {
              type: 'radar-series',
              name: 'Current Time Range',
              color: Color.Gray7
            },
            data: {
              type: 'entity-radar-data-source',
              metrics: [
                {
                  type: 'percentile-latency-metric-aggregation',
                  'display-name': 'P99 Latency'
                },
                {
                  type: 'metric-aggregation',
                  metric: 'duration',
                  aggregation: MetricAggregationType.P50,
                  'display-name': 'P50 Latency'
                },
                {
                  type: 'error-percentage-metric-aggregation',
                  aggregation: MetricAggregationType.Average,
                  'display-name': 'Error %'
                },

                {
                  type: 'metric-aggregation',
                  metric: 'errorCount',
                  aggregation: MetricAggregationType.Sum,
                  'display-name': 'Error Count'
                },
                {
                  type: 'metric-aggregation',
                  metric: 'numCalls',
                  aggregation: MetricAggregationType.AvgrateSecond,
                  'display-name': 'Call Rate/sec'
                },
                {
                  type: 'metric-aggregation',
                  metric: 'numCalls',
                  aggregation: MetricAggregationType.Sum,
                  'display-name': 'Call Count'
                }
              ]
            }
          },
          {
            type: 'top-n-widget',
            header: {
              type: 'widget-header',
              title: 'Top Endpoints'
            },
            data: {
              type: 'top-n-data-source',
              entity: ObservabilityEntityType.Api,
              'result-limit': 10,
              options: [
                {
                  type: 'top-n-explore-selection',
                  metric: {
                    type: 'explore-selection',
                    'display-name': 'Calls',
                    metric: 'numCalls',
                    aggregation: MetricAggregationType.Sum
                  },
                  context: ObservabilityEntityType.Api
                },
                {
                  type: 'top-n-explore-selection',
                  metric: {
                    type: 'explore-selection',
                    'display-name': 'Errors',
                    metric: 'errorCount',
                    aggregation: MetricAggregationType.Sum
                  },
                  context: ObservabilityEntityType.Api
                },
                {
                  type: 'top-n-explore-selection',
                  metric: {
                    type: 'explore-selection',
                    'display-name': 'p99 Latency',
                    metric: 'duration',
                    aggregation: MetricAggregationType.P99
                  },
                  context: ObservabilityEntityType.Api
                },
                {
                  type: 'top-n-explore-selection',
                  metric: {
                    type: 'explore-selection',
                    'display-name': 'p50 Latency',
                    metric: 'duration',
                    aggregation: MetricAggregationType.P50
                  },
                  context: ObservabilityEntityType.Api
                }
              ]
            }
          }
        ]
      }
    ]
  }
};

import { LegendPosition } from '../../../../shared/components/legend/legend.component';
import { RED_COLOR_PALETTE } from '../../../../shared/constants/color-palette';
import { DashboardDefaultConfiguration } from '../../../../shared/dashboard/dashboard-wrapper/navigable-dashboard.module';
import { MetricAggregationType } from '../../../../shared/graphql/model/metrics/metric-aggregation';

export const apiMetricsDashboard: DashboardDefaultConfiguration = {
  location: 'API_METRICS',
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
        }
      ],
      'row-dimensions': [
        {
          type: 'dimension-model',
          dimension: 32,
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
          dimension: 320,
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
        },
        {
          type: 'cell-span-model',
          'col-start': 0,
          'col-end': 1,
          'row-start': 4,
          'row-end': 5
        },
        {
          type: 'cell-span-model',
          'col-start': 0,
          'col-end': 1,
          'row-start': 5,
          'row-end': 6
        },
        {
          type: 'cell-span-model',
          'col-start': 0,
          'col-end': 1,
          'row-start': 6,
          'row-end': 7
        },
        {
          type: 'cell-span-model',
          'col-start': 0,
          'col-end': 1,
          'row-start': 7,
          'row-end': 8
        }
      ]
    },
    children: [
      {
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
              'min-dimension': 300
            }
          ],
          'row-dimensions': [
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
              'col-start': 1,
              'col-end': 2,
              'row-start': 0,
              'row-end': 1
            }
          ]
        },
        children: [
          {
            type: 'text-widget',
            text: 'Latency',
            'secondary-text': 'in ms'
          },
          {
            type: 'text-widget',
            text: 'Errors'
          }
        ]
      },
      {
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
              'min-dimension': 300
            }
          ],
          'row-dimensions': [
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
              'col-start': 1,
              'col-end': 2,
              'row-start': 0,
              'row-end': 1
            }
          ]
        },
        children: [
          {
            type: 'cartesian-widget',
            'color-palette': RED_COLOR_PALETTE,
            'selectable-interval': true,
            'legend-position': LegendPosition.TopLeft,
            bands: [
              {
                type: 'band',
                name: 'Average Baseline',
                'upper-bound-name': 'Average Upper Bound',
                'lower-bound-name': 'Average Lower Bound',
                data: {
                  type: 'entity-metric-timeseries-data-source',
                  metric: {
                    type: 'metric-timeseries-band',
                    metric: 'duration',
                    aggregation: MetricAggregationType.Average
                  }
                }
              }
            ],
            series: [
              {
                type: 'series',
                name: 'P50',
                'visualization-type': 'line',
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
                name: 'P95',
                'visualization-type': 'line',
                data: {
                  type: 'entity-metric-timeseries-data-source',
                  metric: {
                    type: 'metric-timeseries',
                    metric: 'duration',
                    aggregation: MetricAggregationType.P95
                  }
                }
              },
              {
                type: 'series',
                name: 'P99',
                'visualization-type': 'line',
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
                name: 'Average',
                'visualization-type': 'line',
                data: {
                  type: 'entity-metric-timeseries-data-source',
                  metric: {
                    type: 'metric-timeseries',
                    metric: 'duration',
                    aggregation: MetricAggregationType.Average
                  }
                }
              }
            ],
            'selection-handler': {
              type: 'cartesian-explorer-selection-handler'
            }
          },
          {
            type: 'container-widget',
            layout: {
              type: 'custom-container-layout',
              'enable-style': false,
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
                  dimension: 1,
                  unit: 'FR'
                },
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
                }
              ]
            },
            children: [
              {
                type: 'cartesian-widget',
                'selectable-interval': true,
                'legend-position': LegendPosition.None,
                'show-summary': true,
                title: 'Error Percentage',
                series: [
                  {
                    type: 'series',
                    name: 'Error Percentage',
                    color: '#de3618',
                    'visualization-type': 'area',
                    data: {
                      type: 'entity-error-percentage-timeseries-data-source'
                    }
                  }
                ],
                'selection-handler': {
                  type: 'cartesian-explorer-selection-handler',
                  'show-context-menu': true
                }
              },
              {
                type: 'cartesian-widget',
                'selectable-interval': true,
                'legend-position': LegendPosition.None,
                'show-summary': true,
                title: 'Error Rate',
                bands: [
                  {
                    type: 'band',
                    name: 'Baseline',
                    'upper-bound-name': 'Upper Bound',
                    'lower-bound-name': 'Lower Bound',
                    data: {
                      type: 'entity-metric-timeseries-data-source',
                      metric: {
                        type: 'metric-timeseries-band',
                        metric: 'errorCount',
                        aggregation: MetricAggregationType.AvgrateSecond
                      }
                    }
                  }
                ],
                series: [
                  {
                    type: 'series',
                    name: 'Error Rate',
                    color: '#de3618',
                    'visualization-type': 'area',
                    data: {
                      type: 'entity-metric-timeseries-data-source',
                      metric: {
                        type: 'metric-timeseries',
                        metric: 'errorCount',
                        aggregation: MetricAggregationType.AvgrateSecond
                      }
                    }
                  }
                ],
                'selection-handler': {
                  type: 'cartesian-explorer-selection-handler',
                  'show-context-menu': true
                }
              }
            ]
          }
        ]
      },
      {
        type: 'text-widget',
        text: 'Calls'
      },
      {
        type: 'cartesian-widget',
        'selectable-interval': true,
        'legend-position': LegendPosition.None,
        series: [
          {
            type: 'series',
            name: 'Number of Calls',
            color: '#0076C7',
            'visualization-type': 'column',
            data: {
              type: 'entity-metric-timeseries-data-source',
              metric: {
                type: 'metric-timeseries',
                metric: 'numCalls',
                aggregation: MetricAggregationType.Sum
              }
            }
          }
        ],
        'selection-handler': {
          type: 'cartesian-explorer-selection-handler',
          'show-context-menu': true
        }
      }
    ]
  }
};

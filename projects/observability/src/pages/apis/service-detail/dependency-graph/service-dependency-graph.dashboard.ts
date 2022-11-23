import { DashboardDefaultConfiguration } from '../../../../shared/dashboard/dashboard-wrapper/navigable-dashboard.module';
import {
  defaultPrimaryEdgeMetricCategories,
  defaultSecondaryEdgeMetricCategories
} from '../../../../shared/dashboard/widgets/topology/metric/edge-metric-category';
import {
  defaultPrimaryNodeMetricCategories,
  defaultSecondaryNodeMetricCategories
} from '../../../../shared/dashboard/widgets/topology/metric/node-metric-category';
import { MetricAggregationType } from '../../../../shared/graphql/model/metrics/metric-aggregation';

// tslint:disable: max-file-line-count
export const serviceDependencyGraphDashboard: DashboardDefaultConfiguration = {
  location: 'SERVICE_DEPENDENCY_GRAPH',
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
          dimension: 500,
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
            }
          ],
          'row-dimensions': [
            {
              type: 'dimension-model',
              dimension: 1000,
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
            }
          ]
        },
        children: [
          {
            type: 'topology-widget',
            title: 'Dependency Graph',
            data: {
              type: 'topology-data-source',
              'downstream-entities': ['SERVICE', 'BACKEND'],
              entity: 'SERVICE',
              'node-metrics': {
                type: 'topology-metrics',
                primary: {
                  type: 'topology-metric-with-category',
                  specification: {
                    type: 'percentile-latency-metric-aggregation',
                    'display-name': 'P99 Latency'
                  },
                  categories: [
                    {
                      type: 'topology-metric-category',
                      ...defaultPrimaryNodeMetricCategories[0]
                    },
                    {
                      type: 'topology-metric-category',
                      ...defaultPrimaryNodeMetricCategories[1]
                    },
                    {
                      type: 'topology-metric-category',
                      ...defaultPrimaryNodeMetricCategories[2]
                    },
                    {
                      type: 'topology-metric-category',
                      ...defaultPrimaryNodeMetricCategories[3]
                    },
                    {
                      type: 'topology-metric-category',
                      ...defaultPrimaryNodeMetricCategories[4]
                    }
                  ]
                },
                secondary: {
                  type: 'topology-metric-with-category',
                  specification: {
                    type: 'error-percentage-metric-aggregation',
                    aggregation: MetricAggregationType.Average,
                    'display-name': 'Error %'
                  },
                  categories: [
                    {
                      type: 'topology-metric-category',
                      ...defaultSecondaryNodeMetricCategories[0]
                    },
                    {
                      type: 'topology-metric-category',
                      ...defaultSecondaryNodeMetricCategories[1]
                    }
                  ]
                },
                others: [
                  {
                    type: 'topology-metric-with-category',
                    specification: {
                      type: 'metric-aggregation',
                      metric: 'duration',
                      aggregation: MetricAggregationType.P50,
                      'display-name': 'P50 Latency'
                    }
                  },
                  {
                    type: 'topology-metric-with-category',
                    specification: {
                      type: 'metric-aggregation',
                      metric: 'errorCount',
                      aggregation: MetricAggregationType.Sum,
                      'display-name': 'Error Count'
                    }
                  },
                  {
                    type: 'topology-metric-with-category',
                    specification: {
                      type: 'metric-aggregation',
                      metric: 'numCalls',
                      aggregation: MetricAggregationType.AvgrateSecond,
                      'display-name': 'Call Rate/sec'
                    }
                  },
                  {
                    type: 'topology-metric-with-category',
                    specification: {
                      type: 'metric-aggregation',
                      metric: 'numCalls',
                      aggregation: MetricAggregationType.Sum,
                      'display-name': 'Call Count'
                    }
                  }
                ]
              },
              'edge-metrics': {
                type: 'topology-metrics',
                primary: {
                  type: 'topology-metric-with-category',
                  specification: {
                    type: 'percentile-latency-metric-aggregation',
                    'display-name': 'P99 Latency'
                  },
                  categories: [
                    {
                      type: 'topology-metric-category',
                      ...defaultPrimaryEdgeMetricCategories[0]
                    },
                    {
                      type: 'topology-metric-category',
                      ...defaultPrimaryEdgeMetricCategories[1]
                    },
                    {
                      type: 'topology-metric-category',
                      ...defaultPrimaryEdgeMetricCategories[2]
                    },
                    {
                      type: 'topology-metric-category',
                      ...defaultPrimaryEdgeMetricCategories[3]
                    },
                    {
                      type: 'topology-metric-category',
                      ...defaultPrimaryEdgeMetricCategories[4]
                    }
                  ]
                },
                secondary: {
                  type: 'topology-metric-with-category',
                  specification: {
                    type: 'error-percentage-metric-aggregation',
                    aggregation: MetricAggregationType.Average,
                    'display-name': 'Error %'
                  },
                  categories: [
                    {
                      type: 'topology-metric-category',
                      ...defaultSecondaryEdgeMetricCategories[0]
                    },
                    {
                      type: 'topology-metric-category',
                      ...defaultSecondaryEdgeMetricCategories[1]
                    }
                  ]
                },
                others: [
                  {
                    type: 'topology-metric-with-category',
                    specification: {
                      type: 'metric-aggregation',
                      metric: 'duration',
                      aggregation: MetricAggregationType.P50,
                      'display-name': 'P50 Latency'
                    }
                  },
                  {
                    type: 'topology-metric-with-category',
                    specification: {
                      type: 'metric-aggregation',
                      metric: 'errorCount',
                      aggregation: MetricAggregationType.Sum,
                      'display-name': 'Error Count'
                    }
                  },
                  {
                    type: 'topology-metric-with-category',
                    specification: {
                      type: 'metric-aggregation',
                      metric: 'numCalls',
                      aggregation: MetricAggregationType.AvgrateSecond,
                      'display-name': 'Call Rate/sec'
                    }
                  },
                  {
                    type: 'topology-metric-with-category',
                    specification: {
                      type: 'metric-aggregation',
                      metric: 'numCalls',
                      aggregation: MetricAggregationType.Sum,
                      'display-name': 'Call Count'
                    }
                  }
                ]
              }
            }
          }
        ]
      }
    ]
  }
};

import { GraphQlRequestCacheability } from '@hypertrace/graphql-client';
import { ModelJson } from '@hypertrace/hyperdash';
import { MetricAggregationType } from '../../../../../public-api';

export const postDeploymentMetricsJson: ModelJson = {
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
        dimension: 88,
        unit: 'PX'
      }
    ],
    'cell-spans': [
      {
        type: 'cell-span-model',
        'col-start': 0,
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
        'col-start': 1,
        'col-end': 2,
        'row-start': 1,
        'row-end': 2
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
          size: 'small',
          data: {
            type: 'entity-metric-aggregation-data-source',
            'request-options': {
              type: 'request-options',
              cacheability: GraphQlRequestCacheability.NotCacheable
            },
            metric: {
              type: 'metric-aggregation',
              metric: 'duration',
              aggregation: MetricAggregationType.P99
            }
          }
        },
        {
          type: 'metric-display-widget',
          title: 'P95 Latency',
          subscript: 'ms',
          size: 'small',
          data: {
            type: 'entity-metric-aggregation-data-source',
            'request-options': {
              type: 'request-options',
              cacheability: GraphQlRequestCacheability.NotCacheable
            },
            metric: {
              type: 'metric-aggregation',
              metric: 'duration',
              aggregation: MetricAggregationType.P95
            }
          }
        },
        {
          type: 'metric-display-widget',
          title: 'P50 Latency',
          subscript: 'ms',
          size: 'small',
          data: {
            type: 'entity-metric-aggregation-data-source',
            'request-options': {
              type: 'request-options',
              cacheability: GraphQlRequestCacheability.NotCacheable
            },
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
          title: 'Errors/Sec',
          size: 'small',
          data: {
            type: 'entity-metric-aggregation-data-source',
            'request-options': {
              type: 'request-options',
              cacheability: GraphQlRequestCacheability.NotCacheable
            },
            metric: {
              type: 'metric-aggregation',
              metric: 'errorCount',
              aggregation: MetricAggregationType.AvgrateSecond
            }
          }
        },
        {
          type: 'metric-display-widget',
          title: 'Total Errors',
          size: 'small',
          data: {
            type: 'entity-metric-aggregation-data-source',
            'request-options': {
              type: 'request-options',
              cacheability: GraphQlRequestCacheability.NotCacheable
            },
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
          title: 'Calls/Sec',
          size: 'small',
          data: {
            type: 'entity-metric-aggregation-data-source',
            'request-options': {
              type: 'request-options',
              cacheability: GraphQlRequestCacheability.NotCacheable
            },
            metric: {
              type: 'metric-aggregation',
              metric: 'numCalls',
              aggregation: MetricAggregationType.AvgrateSecond
            }
          }
        },
        {
          type: 'metric-display-widget',
          title: 'Total Calls',
          size: 'small',
          data: {
            type: 'entity-metric-aggregation-data-source',
            'request-options': {
              type: 'request-options',
              cacheability: GraphQlRequestCacheability.NotCacheable
            },
            metric: {
              type: 'metric-aggregation',
              metric: 'numCalls',
              aggregation: MetricAggregationType.Sum
            }
          }
        }
      ]
    }
  ]
};

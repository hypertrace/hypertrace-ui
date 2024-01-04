import { ModelJson } from '@hypertrace/hyperdash';
import { DashboardDefaultConfiguration } from '../../../shared/dashboard/dashboard-wrapper/navigable-dashboard.module';
import {
  defaultPrimaryEdgeMetricCategories,
  defaultSecondaryEdgeMetricCategories,
} from '../../../shared/dashboard/widgets/topology/metric/edge-metric-category';
import {
  defaultPrimaryNodeMetricCategories,
  defaultSecondaryNodeMetricCategories,
} from '../../../shared/dashboard/widgets/topology/metric/node-metric-category';
import { MetricAggregationType } from '../../../shared/graphql/model/metrics/metric-aggregation';
import { TopologyEdgeFilterConfig } from '../../../shared/dashboard/data/graphql/topology/topology-data-source.model';

export const getTopologyJson = (options?: TopologyJsonOptions): ModelJson => ({
  type: 'topology-widget',
  showBrush: options?.showBrush ?? true, // Default to `true`
  layoutType: '${layoutType}',
  data: {
    type: 'topology-data-source',
    entity: 'SERVICE',
    'downstream-entities': ['SERVICE', 'BACKEND'],
    'edge-filter-config': options?.edgeFilterConfig,
    'edge-metrics': {
      type: 'topology-metrics',
      primary: {
        type: 'topology-metric-with-category',
        specification: {
          type: 'percentile-latency-metric-aggregation',
          'display-name': 'P99 Latency',
        },
        categories: [
          {
            type: 'topology-metric-category',
            ...defaultPrimaryEdgeMetricCategories[0],
          },
          {
            type: 'topology-metric-category',
            ...defaultPrimaryEdgeMetricCategories[1],
          },
          {
            type: 'topology-metric-category',
            ...defaultPrimaryEdgeMetricCategories[2],
          },
          {
            type: 'topology-metric-category',
            ...defaultPrimaryEdgeMetricCategories[3],
          },
          {
            type: 'topology-metric-category',
            ...defaultPrimaryEdgeMetricCategories[4],
          },
        ],
      },
      secondary: {
        type: 'topology-metric-with-category',
        specification: {
          type: 'error-percentage-metric-aggregation',
          aggregation: MetricAggregationType.Average,
          'display-name': 'Error %',
        },
        categories: [
          {
            type: 'topology-metric-category',
            ...defaultSecondaryEdgeMetricCategories[0],
          },
          {
            type: 'topology-metric-category',
            ...defaultSecondaryEdgeMetricCategories[1],
          },
        ],
      },
      others: [
        {
          type: 'topology-metric-with-category',
          specification: {
            type: 'metric-aggregation',
            metric: 'duration',
            aggregation: MetricAggregationType.P50,
            'display-name': 'P50 Latency',
          },
        },
        {
          type: 'topology-metric-with-category',
          specification: {
            type: 'metric-aggregation',
            metric: 'errorCount',
            aggregation: MetricAggregationType.Sum,
            'display-name': 'Error Count',
          },
        },
        {
          type: 'topology-metric-with-category',
          specification: {
            type: 'metric-aggregation',
            metric: 'numCalls',
            aggregation: MetricAggregationType.AvgrateSecond,
            'display-name': 'Call Rate/sec',
          },
        },
        {
          type: 'topology-metric-with-category',
          specification: {
            type: 'metric-aggregation',
            metric: 'numCalls',
            aggregation: MetricAggregationType.Sum,
            'display-name': 'Call Count',
          },
        },
      ],
    },
    'node-metrics': {
      type: 'topology-metrics',
      primary: {
        type: 'topology-metric-with-category',
        specification: {
          type: 'percentile-latency-metric-aggregation',
          'display-name': 'P99 Latency',
        },
        categories: [
          {
            type: 'topology-metric-category',
            ...defaultPrimaryNodeMetricCategories[0],
          },
          {
            type: 'topology-metric-category',
            ...defaultPrimaryNodeMetricCategories[1],
          },
          {
            type: 'topology-metric-category',
            ...defaultPrimaryNodeMetricCategories[2],
          },
          {
            type: 'topology-metric-category',
            ...defaultPrimaryNodeMetricCategories[3],
          },
          {
            type: 'topology-metric-category',
            ...defaultPrimaryNodeMetricCategories[4],
          },
        ],
      },
      secondary: {
        type: 'topology-metric-with-category',
        specification: {
          type: 'error-percentage-metric-aggregation',
          aggregation: MetricAggregationType.Average,
          'display-name': 'Error %',
        },
        categories: [
          {
            type: 'topology-metric-category',
            ...defaultSecondaryNodeMetricCategories[0],
          },
          {
            type: 'topology-metric-category',
            ...defaultSecondaryNodeMetricCategories[1],
          },
        ],
      },
      others: [
        {
          type: 'topology-metric-with-category',
          specification: {
            type: 'metric-aggregation',
            metric: 'duration',
            aggregation: MetricAggregationType.P50,
            'display-name': 'P50 Latency',
          },
        },
        {
          type: 'topology-metric-with-category',
          specification: {
            type: 'metric-aggregation',
            metric: 'errorCount',
            aggregation: MetricAggregationType.Sum,
            'display-name': 'Error Count',
          },
        },
        {
          type: 'topology-metric-with-category',
          specification: {
            type: 'metric-aggregation',
            metric: 'numCalls',
            aggregation: MetricAggregationType.AvgrateSecond,
            'display-name': 'Call Rate/sec',
          },
        },
        {
          type: 'topology-metric-with-category',
          specification: {
            type: 'metric-aggregation',
            metric: 'numCalls',
            aggregation: MetricAggregationType.Sum,
            'display-name': 'Call Count',
          },
        },
      ],
    },
  },
});

export const applicationFlowDefaultJson: DashboardDefaultConfiguration = {
  location: 'APPLICATION_FLOW',
  json: {
    type: 'container-widget',
    layout: {
      type: 'auto-container-layout',
      'enable-style': false,
    },
    children: [getTopologyJson()],
  },
};

export interface TopologyJsonOptions {
  showBrush?: boolean;
  edgeFilterConfig?: TopologyEdgeFilterConfig;
}

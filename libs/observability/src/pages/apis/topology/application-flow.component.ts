import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModelJson } from '@hypertrace/hyperdash';
import { MetricAggregationType } from '../../../shared/graphql/model/metrics/metric-aggregation';
import {
  defaultPrimaryEdgeMetricCategories,
  defaultSecondaryEdgeMetricCategories
} from './../../../shared/dashboard/widgets/topology/metric/edge-metric-category';
import {
  defaultPrimaryNodeMetricCategories,
  defaultSecondaryNodeMetricCategories
} from './../../../shared/dashboard/widgets/topology/metric/node-metric-category';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="vertical-flex-layout">
      <ht-page-header></ht-page-header>
      <ht-navigable-dashboard [navLocation]="this.location" [defaultJson]="this.defaultJson"> </ht-navigable-dashboard>
    </div>
  `
})
export class ApplicationFlowComponent {
  public readonly location: string = 'APPLICATION_FLOW';
  public readonly defaultJson: ModelJson = {
    type: 'container-widget',
    layout: {
      type: 'auto-container-layout',
      'enable-style': false
    },
    children: [
      {
        type: 'topology-widget',
        data: {
          type: 'topology-data-source',
          entity: 'SERVICE',
          'downstream-entities': ['SERVICE', 'BACKEND'],
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
          },
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
          }
        }
      }
    ]
  };
}

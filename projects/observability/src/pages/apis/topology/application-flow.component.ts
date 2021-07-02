import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Color } from '@hypertrace/common';
import { MetricAggregationType } from '@hypertrace/distributed-tracing';
import { ModelJson } from '@hypertrace/hyperdash';
import { SecondaryNodeMetricCategoryValueType } from '../../../shared/dashboard/widgets/topology/metric/node-metric-category';

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
          'node-metrics': {
            primary: {
              specification: {
                type: 'percentile-latency-metric-aggregation',
                'display-name': 'P99 Latency'
              }
            },
            secondary: {
              specification: {
                type: 'error-percentage-metric-aggregation',
                aggregation: MetricAggregationType.Average,
                'display-name': 'Error %'
              },
              categories: [
                {
                  value: SecondaryNodeMetricCategoryValueType.GreaterThanOrEqualTo5,
                  color: Color.Orange3,
                  secondaryColor: Color.Orange5,
                  focusedColor: Color.Orange3,
                  categoryClass: 'greater-than-or-equal-to-5-secondary-category'
                }
              ]
            },
            others: [
              {
                specification: {
                  type: 'metric-aggregation',
                  metric: 'duration',
                  aggregation: MetricAggregationType.P50,
                  'display-name': 'P50 Latency'
                }
              },
              {
                specification: {
                  type: 'metric-aggregation',
                  metric: 'errorCount',
                  aggregation: MetricAggregationType.Sum,
                  'display-name': 'Error Count'
                }
              },
              {
                specification: {
                  type: 'metric-aggregation',
                  metric: 'numCalls',
                  aggregation: MetricAggregationType.AvgrateSecond,
                  'display-name': 'Call Rate/sec'
                }
              },
              {
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
            primary: {
              specification: {
                type: 'percentile-latency-metric-aggregation',
                'display-name': 'P99 Latency'
              }
            },
            secondary: {
              specification: {
                type: 'error-percentage-metric-aggregation',
                aggregation: MetricAggregationType.Average,
                'display-name': 'Error %'
              }
            },
            others: [
              {
                specification: {
                  type: 'metric-aggregation',
                  metric: 'duration',
                  aggregation: MetricAggregationType.P50,
                  'display-name': 'P50 Latency'
                }
              },
              {
                specification: {
                  type: 'metric-aggregation',
                  metric: 'errorCount',
                  aggregation: MetricAggregationType.Sum,
                  'display-name': 'Error Count'
                }
              },
              {
                specification: {
                  type: 'metric-aggregation',
                  metric: 'numCalls',
                  aggregation: MetricAggregationType.AvgrateSecond,
                  'display-name': 'Call Rate/sec'
                }
              },
              {
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

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MetricAggregationType } from '@hypertrace/distributed-tracing';
import { ModelJson } from '@hypertrace/hyperdash';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="vertical-flex-layout">
      <htc-page-header></htc-page-header>
      <htc-navigable-dashboard [navLocation]="this.location" [defaultJson]="this.defaultJson">
      </htc-navigable-dashboard>
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
  };
}

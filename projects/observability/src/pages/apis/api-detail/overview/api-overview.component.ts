import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Color, SubscriptionLifecycle } from '@hypertrace/common';
import { MetricAggregationType } from '@hypertrace/distributed-tracing';
import { Dashboard, ModelJson } from '@hypertrace/hyperdash';
import { LegendPosition } from '../../../../shared/components/legend/legend.component';
import { ApiDetailService } from '../api-detail.service';

@Component({
  providers: [SubscriptionLifecycle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ht-navigable-dashboard
      [navLocation]="this.location"
      [defaultJson]="this.defaultJson"
      (dashboardReady)="this.onDashboardReady($event)"
    >
    </ht-navigable-dashboard>
  `
})
export class ApiOverviewComponent {
  public readonly location: string = 'API_OVERVIEW';
  public readonly defaultJson: ModelJson = {
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
            'selectable-interval': false,
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
            'selectable-interval': false,
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
            'selectable-interval': false,
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
          'upstream-entities': ['SERVICE'],
          'downstream-entities': ['API', 'BACKEND'],
          entity: 'API',
          'node-metrics': [
            {
              type: 'percentile-latency-metric-aggregation',
              'display-name': 'P99 Latency'
            },
            {
              type: 'error-percentage-metric-aggregation',
              aggregation: MetricAggregationType.Average,
              'display-name': 'Error Percentage'
            },
            {
              type: 'metric-aggregation',
              metric: 'duration',
              aggregation: MetricAggregationType.P50,
              'display-name': 'P50 Latency'
            },
            {
              type: 'metric-aggregation',
              metric: 'errorCount',
              aggregation: MetricAggregationType.Sum,
              'display-name': 'Errors'
            },
            {
              type: 'metric-aggregation',
              metric: 'errorCount',
              aggregation: MetricAggregationType.AvgrateSecond,
              'display-name': 'Errors/s'
            },
            {
              type: 'metric-aggregation',
              metric: 'numCalls',
              aggregation: MetricAggregationType.Sum,
              'display-name': 'Calls'
            },
            {
              type: 'metric-aggregation',
              metric: 'numCalls',
              aggregation: MetricAggregationType.AvgrateSecond,
              'display-name': 'Calls/s'
            }
          ],
          'edge-metrics': [
            {
              type: 'percentile-latency-metric-aggregation',
              'display-name': 'P99 Latency'
            },
            {
              type: 'error-percentage-metric-aggregation',
              aggregation: MetricAggregationType.Average,
              'display-name': 'Error Percentage'
            },
            {
              type: 'metric-aggregation',
              metric: 'duration',
              aggregation: MetricAggregationType.P50,
              'display-name': 'P50 Latency'
            },
            {
              type: 'metric-aggregation',
              metric: 'errorCount',
              aggregation: MetricAggregationType.Sum,
              'display-name': 'Errors'
            },
            {
              type: 'metric-aggregation',
              metric: 'errorCount',
              aggregation: MetricAggregationType.AvgrateSecond,
              'display-name': 'Errors/s'
            },
            {
              type: 'metric-aggregation',
              metric: 'numCalls',
              aggregation: MetricAggregationType.Sum,
              'display-name': 'Calls'
            },
            {
              type: 'metric-aggregation',
              metric: 'numCalls',
              aggregation: MetricAggregationType.AvgrateSecond,
              'display-name': 'Calls/s'
            }
          ]
        }
      }
    ]
  };

  public constructor(
    private readonly apiDetailService: ApiDetailService,
    private readonly subscriptionLifecycle: SubscriptionLifecycle
  ) {}

  public onDashboardReady(dashboard: Dashboard): void {
    this.subscriptionLifecycle.add(this.apiDetailService.applyFiltersToDashboard(dashboard));
  }
  // tslint:disable-next-line: max-file-line-count
}

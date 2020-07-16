import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SubscriptionLifecycle } from '@hypertrace/common';
import { StandardTableCellRendererType, TableSortDirection, TableStyle } from '@hypertrace/components';
import { TracingTableCellRenderer } from '@hypertrace/distributed-tracing';
import { Dashboard, ModelJson } from '@hypertrace/hyperdash';
import { ObservabilityTableCellRenderer } from '../../../../shared/components/table/observability-table-cell-renderer';
import { ObservabilityEntityType } from '../../../../shared/graphql/model/schema/entity';
import { ServiceDetailService } from '../service-detail.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SubscriptionLifecycle],
  template: `
    <htc-navigable-dashboard
      [navLocation]="this.location"
      [defaultJson]="this.defaultJson"
      (dashboardReady)="this.onDashboardReady($event)"
    >
    </htc-navigable-dashboard>
  `
})
export class ServiceApisListComponent {
  public readonly location: string = 'SERVICE_APIS_LIST';

  public readonly defaultJson: ModelJson = {
    type: 'table-widget',
    style: TableStyle.FullPage,
    searchable: true,
    columns: [
      {
        type: 'table-widget-column',
        title: 'Name',
        width: '30%',
        display: ObservabilityTableCellRenderer.Entity,
        value: {
          type: 'entity-specification',
          'entity-type': ObservabilityEntityType.Api
        }
      },
      {
        type: 'table-widget-column',
        title: 'p99 Latency',
        display: TracingTableCellRenderer.Metric,
        value: {
          type: 'metric-aggregation',
          metric: 'duration',
          aggregation: 'p99'
        },
        sort: TableSortDirection.Descending
      },
      {
        type: 'table-widget-column',
        title: 'Avg Latency',
        display: TracingTableCellRenderer.Metric,
        value: {
          type: 'metric-aggregation',
          metric: 'duration',
          aggregation: 'avg'
        }
      },
      {
        type: 'table-widget-column',
        title: 'Errors/s',
        display: StandardTableCellRendererType.Number,
        value: {
          type: 'metric-aggregation',
          metric: 'errorCount',
          aggregation: 'avgrate_sec'
        }
      },
      {
        type: 'table-widget-column',
        title: 'Errors',
        display: StandardTableCellRendererType.Number,
        value: {
          type: 'metric-aggregation',
          metric: 'errorCount',
          aggregation: 'sum'
        }
      },
      {
        type: 'table-widget-column',
        title: 'Calls/s',
        display: StandardTableCellRendererType.Number,
        value: {
          type: 'metric-aggregation',
          metric: 'numCalls',
          aggregation: 'avgrate_sec'
        }
      },
      {
        type: 'table-widget-column',
        title: 'Calls',
        display: StandardTableCellRendererType.Number,
        value: {
          type: 'metric-aggregation',
          metric: 'numCalls',
          aggregation: 'sum'
        }
      }
    ],
    data: {
      type: 'entity-table-data-source',
      entity: 'API'
    }
  };

  public constructor(
    private readonly serviceDetailService: ServiceDetailService,
    private readonly subscriptionLifecycle: SubscriptionLifecycle
  ) {}

  public onDashboardReady(dashboard: Dashboard): void {
    this.subscriptionLifecycle.add(this.serviceDetailService.applyFiltersToDashboard(dashboard));
  }
}

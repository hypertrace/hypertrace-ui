import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import {
  CoreTableCellRendererType,
  TableColumnConfig,
  TableDataResponse,
  TableDataSource,
  TableMode,
  TableStyle
} from '@hypertrace/components';

import { map } from 'rxjs/operators';
import { ServiceDeploymentsService } from '../service-deployments.service';
import { DeploymentDataRow, DeploymentsResponse } from '../service-deployments.types';

@Component({
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <ht-table
        [columnConfigs]="this.columnConfigs"
        [data]="this.dataSource$"
        [pageable]="false"
        [resizable]="false"
        mode=${TableMode.Detail}
        display=${TableStyle.Embedded}
        [detailContent]="childDetail"
      >
      </ht-table>
    </div>

    <ng-template #childDetail let-row="row">
      <p>Hello from {{ row.type }}</p>
    </ng-template>
  `,
  selector: 'ht-service-deployments-list'
})
export class ServiceDeploymentsListComponent {
  public constructor(private readonly serviceDeploymentsService: ServiceDeploymentsService) {
    this.buildDataSource();
  }

  @Input()
  public serviceName: string = '';

  public columnConfigs: TableColumnConfig[] = [
    {
      id: 'commit',
      name: 'commit',
      title: 'Commit',
      display: CoreTableCellRendererType.Text,
      visible: true
    },
    {
      id: 'type',
      name: 'type',
      title: 'Type',
      display: CoreTableCellRendererType.Text,
      visible: true
    },
    {
      id: 'status',
      name: 'status',
      title: 'Status',
      display: CoreTableCellRendererType.Text,
      visible: true
    },
    {
      id: 'triggeredBy',
      name: 'triggeredBy',
      title: 'Triggered By',
      display: CoreTableCellRendererType.Text,
      visible: true
    },
    {
      id: 'StartTime',
      name: 'StartTime',
      title: 'Started At',
      display: CoreTableCellRendererType.Timestamp,
      visible: true,
      sortable: true
    },
    {
      id: 'EndTime',
      name: 'EndTime',
      title: 'Completed At',
      display: CoreTableCellRendererType.Timestamp,
      visible: true,
      sortable: true
    }
  ];

  public dataSource$?: TableDataSource<DeploymentDataRow>;

  public buildDataSource(): void {
    this.dataSource$ = {
      getData: () =>
        this.serviceDeploymentsService
          .getAllServiceDeployments(this.serviceName)
          .pipe(map(res => this.formatResponseToTableFormat(res))),
      getScope: () => undefined
    };
  }

  private formatResponseToTableFormat(response: DeploymentsResponse): TableDataResponse<DeploymentDataRow> {
    return {
      data: response.payload.deployments,
      totalCount: response.payload.deployments.length ?? 0
    };
  }
}

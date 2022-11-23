import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import {
  CoreTableCellRendererType,
  TableColumnConfig,
  TableDataResponse,
  TableDataSource,
  TableMode,
  TableStyle
} from '@hypertrace/components';

import { DeploymentsResponse, DeploymentsResponseRow, DeploymentsService, TimeRange } from '@hypertrace/common';
import { map } from 'rxjs/operators';

@Component({
  styleUrls: ['./service-deployments-list.component.scss'],
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
      <ht-service-deployments-expanded-control
        *ngIf="this.showControls(row); else running"
        [deploymentInformation]="row"
      ></ht-service-deployments-expanded-control>
    </ng-template>

    <ng-template #running>
      <span class="deployment-ongoing-message">Deployment is still ongoing, please check later</span>
    </ng-template>
  `,
  selector: 'ht-service-deployments-list'
})
export class ServiceDeploymentsListComponent implements OnChanges {
  public constructor(private readonly deploymentsService: DeploymentsService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.timeRange?.currentValue !== undefined) {
      this.buildDataSource();
    }
  }

  @Input()
  public serviceName: string = '';

  @Input()
  public timeRange!: TimeRange;

  public columnConfigs: TableColumnConfig[] = [
    {
      id: 'commitLink',
      name: 'commitLink',
      title: 'Version',
      display: CoreTableCellRendererType.OpenInNewTab,
      visible: true,
      rendererConfiguration: {
        showLinkText: true,
        openInNewTab: true,
        regexToMatchForWordReplacement: new RegExp(/(.*\S)\/(\S+)/),
        matchIndexToUseWhenRegexMatches: 2
      },
      width: '380px'
    },
    {
      id: 'status',
      name: 'status',
      title: 'Status',
      display: CoreTableCellRendererType.Text,
      visible: true,
      width: '120px'
    },
    {
      id: 'triggeredBy',
      name: 'triggeredBy',
      title: 'Triggered By',
      display: CoreTableCellRendererType.OpenInNewTab,
      rendererConfiguration: {
        showLinkText: true,
        openInNewTab: true,
        linkPrefix: 'https://github.com/',
        replacementTextIfRegexMatches: 'Service Account',
        regexToMatchForHiddenLink: new RegExp(/.*service-account/)
      },
      visible: true
    },
    {
      id: 'type',
      name: 'type',
      title: 'Type',
      display: CoreTableCellRendererType.Text,
      visible: false,
      width: '80px'
    },
    {
      id: 'startTime',
      name: 'startTime',
      title: 'Started At',
      display: CoreTableCellRendererType.Timestamp,
      visible: true
    },
    {
      id: 'endTime',
      name: 'endTime',
      title: 'Completed At',
      display: CoreTableCellRendererType.Timestamp,
      visible: true
    }
  ];

  public dataSource$?: TableDataSource<DeploymentsResponseRow>;

  public buildDataSource(): void {
    this.dataSource$ = {
      getData: () =>
        this.deploymentsService
          .getAllServiceDeployments(this.serviceName, this.timeRange)
          .pipe(map(res => this.formatResponseToTableFormat(res))),
      getScope: () => undefined
    };
  }

  private formatResponseToTableFormat(response: DeploymentsResponse): TableDataResponse<DeploymentsResponseRow> {
    return {
      data: response.payload.deployments ?? [],
      totalCount: response.payload.deployments?.length ?? 0
    };
  }

  public showControls(row: DeploymentsResponseRow): boolean {
    return row.status !== 'RUNNING' && row.endTime !== 0;
  }
}

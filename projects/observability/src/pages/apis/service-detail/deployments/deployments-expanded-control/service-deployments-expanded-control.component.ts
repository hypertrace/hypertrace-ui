import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DeploymentsResponseRow, TimeDuration } from '@hypertrace/common';
import { PredefinedTimeDurationService } from '@hypertrace/components';

@Component({
  styleUrls: ['./service-deployments-expanded-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ht-tab-group [activeTabLabel]="this.activeTabLabel" (activeTabLabelChange)="this.onActiveTabLabelChange($event)">
      <ht-tab label="Post Deployment Metrics Comparison">
        <ht-service-deployment-metrics
          [deploymentEndTime]="this.deploymentInformation.endTime"
        ></ht-service-deployment-metrics>
      </ht-tab>
      <ht-tab label="Associated Pull Requests">
        <ht-service-pull-requests-list
          [deploymentInformation]="this.deploymentInformation"
        ></ht-service-pull-requests-list>
      </ht-tab>
    </ht-tab-group>
  `,
  selector: 'ht-service-deployments-expanded-control'
})
export class ServiceDeploymentsExpandedControlComponent {
  public predefinedTimeDurations: TimeDuration[] = this.predefinedTimeDurationService.getPredefinedTimeDurations();
  public selectedTimeDuration: TimeDuration = this.predefinedTimeDurations[0];

  public activeTabLabel?: string;

  public constructor(private readonly predefinedTimeDurationService: PredefinedTimeDurationService) {}

  public onTimeDurationChange(newSelection: TimeDuration): void {
    this.selectedTimeDuration = newSelection;
  }

  @Input()
  public deploymentInformation!: DeploymentsResponseRow;

  public getTimeBeforeDeployment(): number {
    return this.deploymentInformation.endTime - this.selectedTimeDuration.toMillis();
  }

  public getTimeAfterDeployment(): number {
    return this.deploymentInformation.endTime + this.selectedTimeDuration.toMillis();
  }

  public onActiveTabLabelChange(tabLabel: string): void {
    this.activeTabLabel = tabLabel;
  }
}

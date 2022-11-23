import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DeploymentsResponseRow } from '@hypertrace/common';

@Component({
  styleUrls: ['./service-pull-requests-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pull-requests-list">
      <div class="pull-request-info-row" *ngFor="let pullRequestInfoRow of this.deploymentInformation.prDetails">
        <span class="pull-request-title"
          ><a [href]="pullRequestInfoRow.pr_link" target="_blank">{{ pullRequestInfoRow.pr_title }}</a></span
        >
        <span class="pull-request-jira"
          ><a
            [href]="pullRequestInfoRow.jira_id"
            *ngIf="this.isJiraIdValid(pullRequestInfoRow.jira_id); else noJiraTicket"
            target="_blank"
            >Jira Link</a
          ></span
        >
        <ng-template #noJiraTicket
          ><span>{{ pullRequestInfoRow.jira_id }}</span></ng-template
        >
      </div>
      <div *ngIf="this.deploymentInformation.prDetails.length === 0">
        <span>Associated Pull Requests could not be found for this deployment</span>
      </div>
    </div>
  `,
  selector: 'ht-service-pull-requests-list'
})
export class ServicePullRequestsListComponent {
  @Input()
  public deploymentInformation!: DeploymentsResponseRow;

  public isJiraIdValid(id: string): boolean {
    if (id === 'JIRA not linked' || id === '') {
      return false;
    }

    return true;
  }
}

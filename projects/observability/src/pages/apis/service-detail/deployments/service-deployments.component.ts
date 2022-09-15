import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BreadcrumbsService } from '@hypertrace/components';
import { Observable } from 'rxjs';

@Component({
  styleUrls: ['./service-deployments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="service-deployments">
      <p *ngIf="serviceName$ | async as serviceName; else loading">
        Here is the list of your deployments in last 24 hours for {{ serviceName }}
      </p>
      <ng-template #loading> Loading stuff... </ng-template>
    </main>
  `
})
export class ServiceDeploymentsComponent {
  public serviceName$: Observable<string> = this.breadcrumbsService.getLastBreadCrumbString();
  public constructor(protected readonly breadcrumbsService: BreadcrumbsService) {}
}

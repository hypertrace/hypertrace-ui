import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BreadcrumbsService } from '@hypertrace/components';
import { Observable } from 'rxjs';

@Component({
  styleUrls: ['./service-deployments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="service-deployments">
      <div *ngIf="serviceName$ | async as serviceName; else loading">
        <p>Here is the list of your deployments in last 24 hours for {{ serviceName }}</p>
        <section>
          <ht-service-deployments-list [serviceName]="serviceName"> </ht-service-deployments-list>
        </section>
      </div>
      <ng-template #loading> Loading stuff... </ng-template>
    </main>
  `
})
export class ServiceDeploymentsComponent {
  public serviceName$: Observable<string> = this.breadcrumbsService.getLastBreadCrumbString();
  public constructor(protected readonly breadcrumbsService: BreadcrumbsService) {}
}

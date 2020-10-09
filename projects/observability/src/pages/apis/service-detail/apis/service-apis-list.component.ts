import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SubscriptionLifecycle } from '@hypertrace/common';
import { Dashboard } from '@hypertrace/hyperdash';
import { ServiceDetailService } from '../service-detail.service';
import { serviceApisListDashboard } from './service-apis-list-dashboard';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SubscriptionLifecycle],
  template: `
    <ht-navigable-dashboard
      navLocation="${serviceApisListDashboard.location}"
      (dashboardReady)="this.onDashboardReady($event)"
    >
    </ht-navigable-dashboard>
  `
})
export class ServiceApisListComponent {
  public constructor(
    private readonly serviceDetailService: ServiceDetailService,
    private readonly subscriptionLifecycle: SubscriptionLifecycle
  ) {}

  public onDashboardReady(dashboard: Dashboard): void {
    this.subscriptionLifecycle.add(this.serviceDetailService.applyFiltersToDashboard(dashboard));
  }
}

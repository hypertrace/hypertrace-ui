import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SubscriptionLifecycle } from '@hypertrace/common';
import { NavigableTab } from '@hypertrace/components';
import { ServiceDetailService } from './service-detail.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ServiceDetailService, SubscriptionLifecycle],
  template: `
    <div class="vertical-flex-layout">
      <ht-page-header [tabs]="this.tabs"></ht-page-header>
      <div class="scrollable-container">
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export class ServiceDetailComponent {
  public readonly tabs: NavigableTab[] = [
    {
      path: 'overview',
      label: 'Overview'
    },
    {
      path: 'endpoints',
      label: 'Endpoints'
    },
    {
      path: 'traces',
      label: 'Traces'
    },
    {
      path: 'metrics',
      label: 'Metrics'
    }
  ];
}

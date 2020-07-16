import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SubscriptionLifecycle } from '@hypertrace/common';
import { NavigableTab } from '@hypertrace/components';
import { BackendDetailService } from './backend-detail.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [BackendDetailService, SubscriptionLifecycle],
  template: `
    <div class="vertical-flex-layout">
      <htc-page-header [tabs]="this.tabs"></htc-page-header>
      <div class="scrollable-container">
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export class BackendDetailComponent {
  public readonly tabs: NavigableTab[] = [
    {
      path: 'overview',
      label: "Overview"
    },
    {
      path: 'traces',
      label: "Traces"
    },
    {
      path: 'metrics',
      label: "Metrics"
    }
  ]
}

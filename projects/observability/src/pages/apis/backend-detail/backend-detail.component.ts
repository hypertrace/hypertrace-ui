import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SubscriptionLifecycle } from '@hypertrace/common';
import { BackendDetailService } from './backend-detail.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./backend-detail.component.scss'],
  providers: [BackendDetailService, SubscriptionLifecycle],
  template: `
    <htc-navigable-tab-group>
      <htc-navigable-tab path="overview">
        Overview
      </htc-navigable-tab>
      <htc-navigable-tab path="traces">
        Traces
      </htc-navigable-tab>
      <htc-navigable-tab path="metrics">
        Metrics
      </htc-navigable-tab>
    </htc-navigable-tab-group>
    <div class="tab-content">
      <router-outlet></router-outlet>
    </div>
  `
})
export class BackendDetailComponent {}

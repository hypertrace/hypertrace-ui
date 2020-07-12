import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SubscriptionLifecycle } from '@hypertrace/common';
import { ServiceDetailService } from './service-detail.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./service-detail.component.scss'],
  providers: [ServiceDetailService, SubscriptionLifecycle],
  template: `
    <htc-navigable-tab-group>
      <htc-navigable-tab path="overview">
        Overview
      </htc-navigable-tab>
      <htc-navigable-tab path="endpoints">
        Endpoints
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
export class ServiceDetailComponent {}

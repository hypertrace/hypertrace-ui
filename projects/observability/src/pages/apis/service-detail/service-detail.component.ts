import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ApplicationFeature, FeatureState, FeatureStateResolver, SubscriptionLifecycle } from '@hypertrace/common';
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

  public constructor(private readonly featureStateResolver: FeatureStateResolver) {
    /**
     * TODO: Create a generic config to map tabs to feature flags if more tabs
     * are to be added in the future: https://github.com/razorpay/hypertrace-ui/pull/80#issuecomment-1235141757
     */
    this.featureStateResolver.getFeatureState(ApplicationFeature.InstrumentationQuality).subscribe(
      featureState =>
        featureState === FeatureState.Enabled &&
        this.tabs.push({
          path: 'instrumentation',
          label: 'Instrumentation Quality'
        })
    );
  }
}

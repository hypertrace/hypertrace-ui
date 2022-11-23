import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  ApplicationFeature,
  FeatureState,
  FeatureStateResolver,
  forkJoinSafeEmpty,
  SubscriptionLifecycle
} from '@hypertrace/common';
import { NavigableTab } from '@hypertrace/components';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ServiceDetailService } from './service-detail.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ServiceDetailService, SubscriptionLifecycle],
  template: `
    <div class="vertical-flex-layout">
      <ht-page-header [tabs]="this.enabledTabs$ | async"></ht-page-header>
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
    },
    {
      path: 'dependency-graph',
      label: 'Dependency Graph'
    }
  ];

  public readonly featureFlaggedTabs: NavigableTab[] = [
    {
      path: 'instrumentation',
      label: 'Instrumentation Quality',
      flagName: ApplicationFeature.InstrumentationQuality
    },
    {
      path: 'deployments',
      label: 'Deployments',
      flagName: ApplicationFeature.DeploymentMarkers
    }
  ];

  public enabledTabs$: Observable<NavigableTab[]> = forkJoinSafeEmpty(
    this.featureFlaggedTabs.map(tab => this.featureStateResolver.getFeatureState(tab.flagName!))
  ).pipe(
    map(featureVals => {
      featureVals.map((featureVal, index) => {
        if (featureVal === FeatureState.Enabled) {
          this.tabs.push(this.featureFlaggedTabs[index]);
        }
      });

      return this.tabs;
    })
  );

  public constructor(private readonly featureStateResolver: FeatureStateResolver) {}
}

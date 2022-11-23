import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LoadAsyncModule, SelectModule, TableModule, TabModule, TimeRangeModule } from '@hypertrace/components';
import { DashboardCoreModule } from '@hypertrace/hyperdash-angular';

import { NavigableDashboardModule } from '../../../../public-api';
import { ServiceDeploymentMetricsComponent } from './deployment-metrics/service-deployment-metrics.component';

import { ServiceDeploymentsExpandedControlComponent } from './deployments-expanded-control/service-deployments-expanded-control.component';
import { ServiceDeploymentsListComponent } from './deployments-list/service-deployments-list.component';
import { ServicePostDeploymentMetricsComponent } from './post-deployment-metrics/service-post-deployment-metrics.component';
import { ServicePullRequestsListComponent } from './pull-requests-list/service-pull-requests-list.component';
import { ServiceDeploymentsComponent } from './service-deployments.component';

@NgModule({
  imports: [
    CommonModule,
    LoadAsyncModule,
    TableModule,
    TimeRangeModule,
    SelectModule,
    DashboardCoreModule,
    NavigableDashboardModule,
    TabModule
  ],
  declarations: [
    ServiceDeploymentsComponent,
    ServiceDeploymentsListComponent,
    ServiceDeploymentsExpandedControlComponent,
    ServicePostDeploymentMetricsComponent,
    ServicePullRequestsListComponent,
    ServiceDeploymentMetricsComponent
  ],
  exports: [ServiceDeploymentsComponent],
  providers: []
})
export class ServiceDeploymentsModule {}

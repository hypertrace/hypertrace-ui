import { HtRoute } from '@hypertrace/common';

import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  ServiceApisListComponent,
  ServiceDeploymentsComponent,
  ServiceDetailComponent,
  ServiceDetailModule,
  ServiceInstrumentationComponent,
  ServiceMetricsComponent,
  ServiceOverviewComponent,
  ServiceTraceListComponent
} from '@hypertrace/observability';

const ROUTE_CONFIG: HtRoute[] = [
  {
    path: '',
    component: ServiceDetailComponent,
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full'
      },
      {
        path: 'overview',
        component: ServiceOverviewComponent
      },
      {
        path: 'endpoints',
        component: ServiceApisListComponent
      },
      {
        path: 'traces',
        component: ServiceTraceListComponent
      },
      {
        path: 'metrics',
        component: ServiceMetricsComponent
      },
      {
        path: 'instrumentation',
        component: ServiceInstrumentationComponent
      },
      {
        path: 'deployments',
        component: ServiceDeploymentsComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(ROUTE_CONFIG), ServiceDetailModule]
})
export class ServiceDetailRoutingModule {}

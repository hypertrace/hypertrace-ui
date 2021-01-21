import { TraceRoute } from '@hypertrace/common';

import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  ServiceApisListComponent,
  ServiceDetailComponent,
  ServiceDetailModule,
  ServiceMetricsComponent,
  ServiceOverviewComponent,
  ServiceTraceListComponent
} from '@hypertrace/observability';

const ROUTE_CONFIG: TraceRoute[] = [
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
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(ROUTE_CONFIG), ServiceDetailModule]
})
export class ServiceDetailRoutingModule {}

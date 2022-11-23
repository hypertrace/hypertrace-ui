import { HtRoute } from '@hypertrace/common';

import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  InstrumentationDetailsComponent,
  InstrumentationOverviewComponent,
  ServiceApisListComponent,
  ServiceDependencyGraphComponent,
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
        component: ServiceInstrumentationComponent,
        children: [
          { path: '', component: InstrumentationOverviewComponent },
          { path: ':category', component: InstrumentationDetailsComponent }
        ]
      },
      {
        path: 'deployments',
        component: ServiceDeploymentsComponent
      },
      {
        path: 'dependency-graph',
        component: ServiceDependencyGraphComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(ROUTE_CONFIG), ServiceDetailModule]
})
export class ServiceDetailRoutingModule {}

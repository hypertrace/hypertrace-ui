import { HtRoute } from '@hypertrace/common';

import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  BackendDetailComponent,
  BackendDetailModule,
  BackendMetricsComponent,
  BackendOverviewComponent,
  BackendTraceListComponent
} from '@hypertrace/observability';

const ROUTE_CONFIG: HtRoute[] = [
  {
    path: '',
    component: BackendDetailComponent,
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full'
      },
      {
        path: 'overview',
        component: BackendOverviewComponent
      },
      {
        path: 'traces',
        component: BackendTraceListComponent
      },
      {
        path: 'metrics',
        component: BackendMetricsComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(ROUTE_CONFIG), BackendDetailModule]
})
export class BackendDetailRoutingModule {}

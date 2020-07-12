import { TraceRoute } from '@hypertrace/common';

import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  ApiDetailComponent,
  ApiDetailModule,
  ApiMetricsComponent,
  ApiOverviewComponent,
  ApiTraceListComponent
} from '@hypertrace/observability';

const ROUTE_CONFIG: TraceRoute[] = [
  {
    path: '',
    component: ApiDetailComponent,
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full'
      },
      {
        path: 'overview',
        component: ApiOverviewComponent
      },
      {
        path: 'traces',
        component: ApiTraceListComponent
      },
      {
        path: 'metrics',
        component: ApiMetricsComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(ROUTE_CONFIG), ApiDetailModule]
})
export class ApiDetailRoutingModule {}

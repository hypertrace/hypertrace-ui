import { RouterModule } from '@angular/router';

import { NgModule } from '@angular/core';
import { HtRoute } from '@hypertrace/common';
import {
  BackendDetailBreadcrumbResolver,
  BackendDetailService,
  BackendListComponent,
  BackendListModule
} from '@hypertrace/observability';

const ROUTE_CONFIG: HtRoute[] = [
  {
    path: '',
    component: BackendListComponent
  },
  {
    path: `backend/:${BackendDetailService.BACKEND_ID_PARAM_NAME}`,
    resolve: {
      breadcrumb: BackendDetailBreadcrumbResolver
    },
    loadChildren: () =>
      import('./backend-detail/backend-detail-routing.module').then(module => module.BackendDetailRoutingModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(ROUTE_CONFIG), BackendListModule]
})
export class BackendsRoutingModule {}

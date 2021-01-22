import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TraceRoute } from '@hypertrace/common';
import {
  ApiDetailBreadcrumbResolver,
  ApiDetailService,
  EndpointListComponent,
  EndpointListModule
} from '@hypertrace/observability';

const ROUTE_CONFIG: TraceRoute[] = [
  {
    path: '',
    component: EndpointListComponent
  },
  {
    path: `endpoint/:${ApiDetailService.API_ID_PARAM_NAME}`,
    resolve: {
      breadcrumb: ApiDetailBreadcrumbResolver
    },
    loadChildren: () => import('../api-detail/api-detail-routing.module').then(module => module.ApiDetailRoutingModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(ROUTE_CONFIG), EndpointListModule]
})
export class EndpointRoutingModule {}
